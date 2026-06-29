"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";

import { formInputClassName } from "@/components/forms/FormField";
import { getUnitGroups } from "@/lib/units";
import { cn } from "@/lib/utils";

type UnitSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  /** Show a blank option (e.g. reorder unit → same as purchase unit). */
  allowEmpty?: boolean;
  emptyLabel?: string;
  /** Preserve a legacy unit value not in the standard list. */
  extraValue?: string | null;
};

export const UnitSelect = forwardRef<HTMLSelectElement, UnitSelectProps>(function UnitSelect(
  {
    allowEmpty = false,
    emptyLabel = "Select a unit",
    extraValue,
    className,
    ...props
  },
  ref,
) {
  const groups = getUnitGroups(extraValue);

  return (
    <select ref={ref} {...props} className={cn(formInputClassName, className)}>
      {allowEmpty ? <option value="">{emptyLabel}</option> : null}
      {Object.entries(groups).map(([groupName, options]) => (
        <optgroup key={groupName} label={groupName}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
});
