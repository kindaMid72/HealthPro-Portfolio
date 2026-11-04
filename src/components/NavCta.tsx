import Link from "next/link";

interface NavCtaProps {
  bookingUrl: string | null;
  whatsappFallback: string | null;
  className?: string;
  size?: "sm" | "md";
}

/** CTA utama navbar: booking → WhatsApp → lihat jadwal. */
export default function NavCta({ bookingUrl, whatsappFallback, className = "", size = "sm" }: NavCtaProps) {
  const sizeClass = size === "sm" ? "btn-sm" : "";
  const external = bookingUrl ?? whatsappFallback;
  if (external) {
    return (
      <a
        href={external}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-accent ${sizeClass} ${className}`}
      >
        {bookingUrl ? "Booking" : "WhatsApp"}
      </a>
    );
  }
  return (
    <Link href="/#lokasi" className={`btn btn-secondary ${sizeClass} ${className}`}>
      Lihat jadwal
    </Link>
  );
}
