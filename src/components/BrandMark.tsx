/**
 * components/BrandMark.tsx
 * Logo: huruf "Y" yang juga tabung stetoskop (earpiece + chest-piece).
 * Geometri harus sinkron dengan src/app/icon.svg dan src/app/opengraph-image.tsx
 * (keduanya tidak bisa import komponen React).
 */
export default function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M12 9C12 19 17 24.5 24 26.5C31 24.5 36 19 36 9" />
      <path d="M24 26.5V34" />
      <circle cx="24" cy="39.5" r="4.6" />
      <circle cx="12" cy="8" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="36" cy="8" r="2.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
