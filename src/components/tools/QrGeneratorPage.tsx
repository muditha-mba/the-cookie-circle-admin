"use client";

import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { SecondaryButton, PrimaryButton } from "@/components/data/PageActions";
import { formInputClassName, FormField } from "@/components/forms/FormField";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import {
  buildMarketingUrl,
  buildQrDownloadFilename,
  CUSTOM_OPTION,
  LANDING_PATH_PRESETS,
  resolveUtmField,
  slugifyUtm,
  UTM_MEDIUM_PRESETS,
  UTM_SOURCE_PRESETS,
} from "@/lib/marketing/utm";
import { downloadQrPng, generateQrDataUrl } from "@/lib/marketing/qr";
import { cn } from "@/lib/utils";

export function QrGeneratorPage() {
  const [landingPath, setLandingPath] = useState("/order");
  const [utmSource, setUtmSource] = useState("qr");
  const [utmSourceCustom, setUtmSourceCustom] = useState("");
  const [utmMedium, setUtmMedium] = useState("print");
  const [utmMediumCustom, setUtmMediumCustom] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const resolvedSource = useMemo(
    () => resolveUtmField(utmSource, utmSourceCustom),
    [utmSource, utmSourceCustom],
  );

  const resolvedMedium = useMemo(
    () => resolveUtmField(utmMedium, utmMediumCustom),
    [utmMedium, utmMediumCustom],
  );

  const resolvedCampaign = useMemo(() => {
    const trimmed = utmCampaign.trim();
    if (!trimmed) {
      return { value: null as string | null, error: null as string | null };
    }

    const slug = slugifyUtm(trimmed);
    if (!slug) {
      return { value: null, error: "Enter a campaign slug or leave blank." };
    }

    return { value: slug, error: null };
  }, [utmCampaign]);

  const validationError =
    resolvedSource.error ??
    resolvedMedium.error ??
    resolvedCampaign.error ??
    null;

  const marketingUrl = useMemo(() => {
    if (!resolvedSource.value || !resolvedMedium.value || validationError) {
      return null;
    }

    return buildMarketingUrl({
      landingPath,
      utmSource: resolvedSource.value,
      utmMedium: resolvedMedium.value,
      utmCampaign: resolvedCampaign.value,
    });
  }, [
    landingPath,
    resolvedSource.value,
    resolvedMedium.value,
    resolvedCampaign.value,
    validationError,
  ]);

  useEffect(() => {
    if (!marketingUrl) {
      setQrDataUrl(null);
      return;
    }

    let cancelled = false;
    setQrLoading(true);

    generateQrDataUrl(marketingUrl)
      .then((dataUrl) => {
        if (!cancelled) {
          setQrDataUrl(dataUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrDataUrl(null);
          toast.error("Unable to generate QR preview.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setQrLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [marketingUrl]);

  const handleCopyUrl = async () => {
    if (!marketingUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(marketingUrl);
      setCopied(true);
      toast.success("URL copied to clipboard.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Unable to copy URL.");
    }
  };

  const handleDownload = async () => {
    if (!marketingUrl || !resolvedSource.value || !resolvedMedium.value) {
      return;
    }

    setDownloading(true);
    try {
      const filename = buildQrDownloadFilename({
        utmSource: resolvedSource.value,
        utmMedium: resolvedMedium.value,
        utmCampaign: resolvedCampaign.value,
      });
      await downloadQrPng(marketingUrl, filename);
      toast.success("QR code downloaded.");
    } catch {
      toast.error("Unable to download QR code.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DashboardPageShell
      title="QR Generator"
      description="Create tracked marketing links and print-ready QR codes for flyers, packaging, and campaigns."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="space-y-6 rounded-lg border border-border bg-surface p-6">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Link settings</h2>
            <p className="mt-1 text-xs text-text-muted">
              UTMs are captured on first visit for CRM attribution and GA4 when enabled on
              production.
            </p>
          </div>

          <FormField
            label="Landing page"
            htmlFor="landing-path"
            hint="Use /order for flyers and packaging."
          >
            <select
              id="landing-path"
              className={formInputClassName}
              value={landingPath}
              onChange={(event) => setLandingPath(event.target.value)}
            >
              {LANDING_PATH_PRESETS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="utm_source"
            htmlFor="utm-source"
            error={resolvedSource.error ?? undefined}
            info="Where traffic comes from — e.g. qr, instagram, facebook."
          >
            <select
              id="utm-source"
              className={formInputClassName}
              value={utmSource}
              onChange={(event) => setUtmSource(event.target.value)}
            >
              {UTM_SOURCE_PRESETS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.value})
                </option>
              ))}
              <option value={CUSTOM_OPTION}>Custom…</option>
            </select>
          </FormField>

          {utmSource === CUSTOM_OPTION ? (
            <FormField label="Custom utm_source" htmlFor="utm-source-custom">
              <input
                id="utm-source-custom"
                className={formInputClassName}
                placeholder="e.g. pop-up-event"
                value={utmSourceCustom}
                onChange={(event) => setUtmSourceCustom(event.target.value)}
              />
            </FormField>
          ) : null}

          <FormField
            label="utm_medium"
            htmlFor="utm-medium"
            error={resolvedMedium.error ?? undefined}
            info="Channel type — e.g. print, social, paid."
          >
            <select
              id="utm-medium"
              className={formInputClassName}
              value={utmMedium}
              onChange={(event) => setUtmMedium(event.target.value)}
            >
              {UTM_MEDIUM_PRESETS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.value})
                </option>
              ))}
              <option value={CUSTOM_OPTION}>Custom…</option>
            </select>
          </FormField>

          {utmMedium === CUSTOM_OPTION ? (
            <FormField label="Custom utm_medium" htmlFor="utm-medium-custom">
              <input
                id="utm-medium-custom"
                className={formInputClassName}
                placeholder="e.g. event-booth"
                value={utmMediumCustom}
                onChange={(event) => setUtmMediumCustom(event.target.value)}
              />
            </FormField>
          ) : null}

          <FormField
            label="utm_campaign"
            htmlFor="utm-campaign"
            hint="Optional — use a unique slug per placement (e.g. kandy-flyer)."
            error={resolvedCampaign.error ?? undefined}
          >
            <input
              id="utm-campaign"
              className={formInputClassName}
              placeholder="Leave blank to skip"
              value={utmCampaign}
              onChange={(event) => setUtmCampaign(event.target.value)}
            />
          </FormField>
        </section>

        <section className="space-y-6 rounded-lg border border-border bg-surface p-6">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Preview</h2>
            <p className="mt-1 text-xs text-text-muted">
              Updates as you edit. Download a 1200×1200 PNG suitable for print.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Tracked URL
            </p>
            <div className="rounded-md border border-border bg-background p-3">
              <p
                className={cn(
                  "break-all font-mono text-xs leading-relaxed",
                  marketingUrl ? "text-text-primary" : "text-text-muted",
                )}
              >
                {marketingUrl ?? "Complete the fields above to preview your URL."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <SecondaryButton
                onClick={handleCopyUrl}
                disabled={!marketingUrl}
                className="gap-2"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy URL"}
              </SecondaryButton>
              {marketingUrl ? (
                <a
                  href={marketingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium",
                    "text-text-primary transition-colors hover:bg-surface-hover",
                  )}
                >
                  <ExternalLink size={14} />
                  Open link
                </a>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              QR code
            </p>
            <div className="flex min-h-[280px] items-center justify-center rounded-md border border-dashed border-border bg-background p-6">
              {qrLoading ? (
                <div className="h-48 w-48 animate-pulse rounded-lg bg-surface-hover" />
              ) : qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="QR code preview"
                  className="h-48 w-48 rounded-lg bg-[#FFF9F0] p-3 sm:h-56 sm:w-56"
                />
              ) : (
                <p className="max-w-xs text-center text-sm text-text-muted">
                  QR preview appears when the URL is valid.
                </p>
              )}
            </div>
          </div>

          <PrimaryButton
            type="button"
            disabled={!marketingUrl || !qrDataUrl || downloading}
            onClick={handleDownload}
            className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
          >
            <Download size={16} />
            {downloading ? "Downloading…" : "Download PNG"}
          </PrimaryButton>
        </section>
      </div>
    </DashboardPageShell>
  );
}
