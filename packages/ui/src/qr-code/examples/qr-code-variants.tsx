import { QrCode } from "@cladux/ui";

const value = "https://cladux.vercel.app/docs/components/qr-code";

export default function QrCodeVariants() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <QrCode value={value} size={128} variant="classic" />
      <QrCode value={value} size={128} variant="rounded" className="text-primary" />
      <QrCode value={value} size={128} variant="dots" className="bg-primary/10 text-primary" />
    </div>
  );
}
