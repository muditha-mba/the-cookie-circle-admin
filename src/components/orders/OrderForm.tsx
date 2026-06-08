"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import {
  CollectionSearchSelect,
  type CollectionSearchOption,
} from "@/components/orders/CollectionSearchSelect";
import { CustomerSearchSelect } from "@/components/orders/CustomerSearchSelect";
import type { CustomerSearchOption } from "@/components/orders/CustomerSearchSelect";
import { DeliveryLocationPickerLazy } from "@/components/orders/DeliveryLocationPickerLazy";
import { OrderFinancialSummary } from "@/components/orders/OrderFinancialSummary";
import {
  ProductSearchSelect,
  type ProductSearchOption,
} from "@/components/orders/ProductSearchSelect";
import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "@/config/status-badges";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { businessSettingsApi } from "@/lib/api/business-settings";
import { customersApi } from "@/lib/api/customers";
import { deliveryAreasApi } from "@/lib/api/delivery-areas";
import type { ApiError } from "@/lib/api/types";
import type { OrderPreview } from "@/lib/api/orders";
import { ordersApi } from "@/lib/api/orders";
import {
  orderSchema,
  toValidCollectionLines,
  toValidProductLines,
  type OrderFormValues,
} from "@/lib/validation/order";
import { cn } from "@/lib/utils";

type OrderFormProps = {
  defaultValues?: Partial<OrderFormValues>;
  initialCustomer?: CustomerSearchOption | null;
  productSnapshots?: ProductSearchOption[];
  collectionSnapshots?: CollectionSearchOption[];
  allowScheduledEdit?: boolean;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: OrderFormValues) => Promise<void>;
};

export function OrderForm({
  defaultValues,
  initialCustomer = null,
  productSnapshots,
  collectionSnapshots,
  allowScheduledEdit = false,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: OrderFormProps) {
  const [suggestedScheduled, setSuggestedScheduled] = useState<string | null>(null);
  const [preview, setPreview] = useState<OrderPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_id: "",
      delivery_area_id: "",
      source: "manual",
      payment_method: "cash_on_delivery",
      payment_status: "pending",
      status: "pending",
      requested_delivery_date: "",
      scheduled_delivery_date: "",
      customer_notes: "",
      internal_notes: "",
      delivery_contact_name: "",
      delivery_phone_primary: "",
      delivery_phone_secondary: "",
      delivery_address_line_1: "",
      delivery_address_line_2: "",
      delivery_city: "",
      delivery_postal_code: "",
      delivery_landmark: "",
      delivery_notes: "",
      delivery_latitude: "",
      delivery_longitude: "",
      product_lines: [],
      collection_lines: [{ collection_id: "", quantity: 1 }],
      ...defaultValues,
    },
  });

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = form;
  const deliveryLatitude = watch("delivery_latitude");
  const deliveryLongitude = watch("delivery_longitude");
  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({ control, name: "product_lines" });
  const {
    fields: collectionFields,
    append: appendCollection,
    remove: removeCollection,
  } = useFieldArray({ control, name: "collection_lines" });

  const previewWatch = watch(["delivery_area_id", "product_lines", "collection_lines"]);
  const debouncedPreviewKey = useDebouncedValue(JSON.stringify(previewWatch), 400);
  const previewRequestId = useRef(0);

  const { data: deliveryAreas } = useQuery({
    queryKey: ["delivery-areas", "active"],
    queryFn: () => deliveryAreasApi.listActive(),
  });

  useEffect(() => {
    void (async () => {
      const deliveryRes = await businessSettingsApi.suggestDeliveryDate();
      setSuggestedScheduled(deliveryRes.suggested_delivery_date);
      if (!defaultValues?.scheduled_delivery_date) {
        setValue("scheduled_delivery_date", deliveryRes.suggested_delivery_date);
      }
      if (!defaultValues?.requested_delivery_date) {
        setValue("requested_delivery_date", deliveryRes.suggested_delivery_date);
      }
    })();
  }, [defaultValues?.requested_delivery_date, defaultValues?.scheduled_delivery_date, setValue]);

  useEffect(() => {
    const [deliveryAreaId, productLines, collectionLines] = JSON.parse(debouncedPreviewKey) as [
      string,
      OrderFormValues["product_lines"],
      OrderFormValues["collection_lines"],
    ];

    const previewValues = {
      product_lines: productLines ?? [],
      collection_lines: collectionLines ?? [],
    } as Pick<OrderFormValues, "product_lines" | "collection_lines">;

    const validProducts = toValidProductLines(previewValues as OrderFormValues);
    const validCollections = toValidCollectionLines(previewValues as OrderFormValues);

    if (validProducts.length === 0 && validCollections.length === 0) {
      setPreview(null);
      return;
    }

    const requestId = ++previewRequestId.current;
    void (async () => {
      setIsPreviewLoading(true);
      setPreviewError(null);
      try {
        const result = await ordersApi.preview({
          delivery_area_id: deliveryAreaId || null,
          product_lines: validProducts,
          collection_lines: validCollections,
        });
        if (requestId !== previewRequestId.current) {
          return;
        }
        setPreview(result);
      } catch (err) {
        if (requestId === previewRequestId.current) {
          setPreview(null);
          const apiError = err as ApiError;
          setPreviewError(apiError.message ?? "Unable to calculate order preview.");
        }
      } finally {
        if (requestId === previewRequestId.current) {
          setIsPreviewLoading(false);
        }
      }
    })();
  }, [debouncedPreviewKey]);

  const prefillDeliveryFromCustomer = async (customerId: string) => {
    if (!customerId) {
      return;
    }
    try {
      const customer = await customersApi.get(customerId);
      setValue("delivery_contact_name", `${customer.first_name} ${customer.last_name}`.trim());
      setValue("delivery_phone_primary", customer.phone ?? "");
      setValue("delivery_address_line_1", customer.address_line_1 ?? "");
      setValue("delivery_address_line_2", customer.address_line_2 ?? "");
      setValue("delivery_city", customer.city ?? "");
      setValue("delivery_postal_code", customer.postal_code ?? "");
      setValue("delivery_landmark", customer.landmark ?? "");
    } catch {
      // Keep existing delivery fields if lookup fails.
    }
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-lg border border-border bg-surface p-6"
        noValidate
      >
        <FormField
          label="Customer"
          htmlFor="customer_id"
          error={errors.customer_id?.message}
          hint="Search by name, email, phone, or customer ID"
        >
          <Controller
            control={control}
            name="customer_id"
            render={({ field }) => (
              <CustomerSearchSelect
                value={field.value ?? ""}
                initialCustomer={initialCustomer}
                onChange={(customerId) => {
                  field.onChange(customerId);
                  void prefillDeliveryFromCustomer(customerId);
                }}
              />
            )}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Order source" htmlFor="source" error={errors.source?.message}>
            <select id="source" className={formInputClassName} {...register("source")}>
              <option value="manual">Manual</option>
              <option value="website">Website</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="walk_in">Walk in</option>
              <option value="phone">Phone</option>
            </select>
          </FormField>
          <FormField
            label="Delivery area"
            htmlFor="delivery_area_id"
            error={errors.delivery_area_id?.message}
          >
            <select id="delivery_area_id" className={formInputClassName} {...register("delivery_area_id")}>
              <option value="">Default / no area</option>
              {(deliveryAreas ?? []).map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                  {area.pickup_only ? " (pickup)" : ""}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Payment method"
            htmlFor="payment_method"
            error={errors.payment_method?.message}
          >
            <select id="payment_method" className={formInputClassName} {...register("payment_method")}>
              <option value="cash_on_delivery">Cash on delivery</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="stripe">Stripe</option>
              <option value="manual">Manual</option>
            </select>
          </FormField>
          <FormField
            label="Payment status"
            htmlFor="payment_status"
            error={errors.payment_status?.message}
          >
            <select id="payment_status" className={formInputClassName} {...register("payment_status")}>
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Order status" htmlFor="status" error={errors.status?.message}>
          <select id="status" className={formInputClassName} {...register("status")}>
            {ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Requested delivery date"
            htmlFor="requested_delivery_date"
            error={errors.requested_delivery_date?.message}
            hint="Date the customer asked for"
          >
            <input
              id="requested_delivery_date"
              type="date"
              className={formInputClassName}
              {...register("requested_delivery_date")}
            />
          </FormField>
          <FormField
            label="Scheduled delivery date"
            htmlFor="scheduled_delivery_date"
            error={errors.scheduled_delivery_date?.message}
            hint={
              suggestedScheduled
                ? `Suggested from business rules: ${suggestedScheduled}`
                : "Set by delivery schedule rules"
            }
          >
            <input
              id="scheduled_delivery_date"
              type="date"
              className={formInputClassName}
              readOnly={!allowScheduledEdit}
              {...register("scheduled_delivery_date")}
            />
          </FormField>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-text-primary">Delivery information</h3>
          <p className="text-xs text-text-muted">
            Stored on the order independently from the customer profile.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Contact name" htmlFor="delivery_contact_name">
              <input id="delivery_contact_name" className={formInputClassName} {...register("delivery_contact_name")} />
            </FormField>
            <FormField label="Primary phone" htmlFor="delivery_phone_primary">
              <input id="delivery_phone_primary" className={formInputClassName} {...register("delivery_phone_primary")} />
            </FormField>
            <FormField label="Secondary phone" htmlFor="delivery_phone_secondary">
              <input id="delivery_phone_secondary" className={formInputClassName} {...register("delivery_phone_secondary")} />
            </FormField>
            <FormField label="Address line 1" htmlFor="delivery_address_line_1">
              <input id="delivery_address_line_1" className={formInputClassName} {...register("delivery_address_line_1")} />
            </FormField>
            <FormField label="Address line 2" htmlFor="delivery_address_line_2">
              <input id="delivery_address_line_2" className={formInputClassName} {...register("delivery_address_line_2")} />
            </FormField>
            <FormField label="City" htmlFor="delivery_city">
              <input id="delivery_city" className={formInputClassName} {...register("delivery_city")} />
            </FormField>
            <FormField label="Postal code" htmlFor="delivery_postal_code">
              <input id="delivery_postal_code" className={formInputClassName} {...register("delivery_postal_code")} />
            </FormField>
            <FormField label="Landmark" htmlFor="delivery_landmark">
              <input id="delivery_landmark" className={formInputClassName} {...register("delivery_landmark")} />
            </FormField>
          </div>
          <FormField label="Delivery notes" htmlFor="delivery_notes">
            <textarea id="delivery_notes" rows={2} className={formInputClassName} {...register("delivery_notes")} />
          </FormField>
          <FormField
            label="Delivery location"
            htmlFor="delivery-location-map"
            hint="Search for an address or click the map to set coordinates on this order."
          >
            <DeliveryLocationPickerLazy
              latitude={deliveryLatitude ?? ""}
              longitude={deliveryLongitude ?? ""}
              onChange={(lat, lng) => {
                setValue("delivery_latitude", lat, { shouldDirty: true });
                setValue("delivery_longitude", lng, { shouldDirty: true });
              }}
              onAddressSelect={(address) => {
                if (address.address_line_1) {
                  setValue("delivery_address_line_1", address.address_line_1, { shouldDirty: true });
                }
                if (address.address_line_2) {
                  setValue("delivery_address_line_2", address.address_line_2, { shouldDirty: true });
                }
                if (address.city) {
                  setValue("delivery_city", address.city, { shouldDirty: true });
                }
                if (address.postal_code) {
                  setValue("delivery_postal_code", address.postal_code, { shouldDirty: true });
                }
                if (address.landmark) {
                  setValue("delivery_landmark", address.landmark, { shouldDirty: true });
                }
              }}
            />
          </FormField>
          <input type="hidden" {...register("delivery_latitude")} />
          <input type="hidden" {...register("delivery_longitude")} />
        </div>

        <div className="space-y-3 border-t border-border pt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Products</h3>
            </div>
            <button
              type="button"
              onClick={() => appendProduct({ product_id: "", quantity: 1 })}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-hover"
            >
              <Plus className="h-3.5 w-3.5" />
              Add product
            </button>
          </div>
          {productFields.length === 0 ? (
            <p className="text-xs text-text-muted">No product lines yet.</p>
          ) : (
            productFields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-[1fr_140px_auto]"
              >
                <Controller
                  control={control}
                  name={`product_lines.${index}.product_id`}
                  render={({ field: lineField }) => (
                    <ProductSearchSelect
                      value={lineField.value ?? ""}
                      initialProduct={productSnapshots?.[index] ?? null}
                      onChange={lineField.onChange}
                    />
                  )}
                />
                <input
                  type="number"
                  min={0}
                  step="1"
                  className={formInputClassName}
                  {...register(`product_lines.${index}.quantity`, { valueAsNumber: true })}
                />
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeProduct(index)}
                    className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-md border border-border text-danger hover:bg-danger/10"
                    aria-label="Remove product line"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 border-t border-border pt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Collections</h3>
            </div>
            <button
              type="button"
              onClick={() => appendCollection({ collection_id: "", quantity: 1 })}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-hover"
            >
              <Plus className="h-3.5 w-3.5" />
              Add collection
            </button>
          </div>
          {collectionFields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-[1fr_140px_auto]"
            >
              <Controller
                control={control}
                name={`collection_lines.${index}.collection_id`}
                render={({ field: lineField }) => (
                  <CollectionSearchSelect
                    value={lineField.value ?? ""}
                    initialCollection={collectionSnapshots?.[index] ?? null}
                    onChange={lineField.onChange}
                  />
                )}
              />
              <input
                type="number"
                min={0}
                step="1"
                className={formInputClassName}
                {...register(`collection_lines.${index}.quantity`, { valueAsNumber: true })}
              />
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeCollection(index)}
                  className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-md border border-border text-danger hover:bg-danger/10"
                  aria-label="Remove collection line"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {errors.collection_lines?.message ? (
            <p className="text-sm text-danger">{errors.collection_lines.message}</p>
          ) : null}
        </div>

        <FormField label="Customer notes" htmlFor="customer_notes" error={errors.customer_notes?.message}>
          <textarea id="customer_notes" rows={2} className={formInputClassName} {...register("customer_notes")} />
        </FormField>

        <FormField label="Internal notes" htmlFor="internal_notes" error={errors.internal_notes?.message}>
          <textarea id="internal_notes" rows={3} className={formInputClassName} {...register("internal_notes")} />
        </FormField>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <PrimaryButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </PrimaryButton>
      </form>

      <aside className="space-y-3 xl:sticky xl:top-6 xl:self-start">
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold text-text-primary">Live financial summary</h3>
          <p className="mt-1 text-xs text-text-muted">Updates as you edit lines and delivery area</p>
        </div>
        {isPreviewLoading ? (
          <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
        ) : previewError ? (
          <p className="text-sm text-danger">{previewError}</p>
        ) : preview ? (
          <OrderFinancialSummary
            snapshot={preview}
            productLines={preview.product_lines}
            collectionLines={preview.collection_lines}
          />
        ) : (
          <p className={cn("text-sm text-text-muted")}>Add product or collection lines to see a preview.</p>
        )}
      </aside>
    </div>
  );
}
