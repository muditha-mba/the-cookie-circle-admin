import QRCode from "qrcode";

export const QR_RENDER_OPTIONS: QRCode.QRCodeToDataURLOptions = {
  width: 1200,
  margin: 4,
  errorCorrectionLevel: "H",
  color: {
    dark: "#2D1610",
    light: "#FFF9F0",
  },
};

export async function generateQrDataUrl(marketingUrl: string): Promise<string> {
  return QRCode.toDataURL(marketingUrl, QR_RENDER_OPTIONS);
}

export async function downloadQrPng(marketingUrl: string, filename: string): Promise<void> {
  const dataUrl = await generateQrDataUrl(marketingUrl);
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(objectUrl);
}
