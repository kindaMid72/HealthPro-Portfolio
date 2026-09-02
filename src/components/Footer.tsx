/**
 * components/Footer.tsx
 * Footer sederhana — copyright, back-to-top, disclaimer.
 * Static content only — tidak ada database/backend.
 *
 * Konten disclaimer: placeholder [BELUM DIISI] sesuai aturan 02-content-data.md.
 * Styling: sesuai 04-design.md — primary-dark background, teks muted.
 * Note: Server Component — tidak ada event handler.
 */

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer
      id="footer"
      role="contentinfo"
      className="bg-primary-dark text-white/70 py-10 px-4"
    >
      <div className="mx-auto max-w-5xl flex flex-col items-center gap-4 text-center">

        {/* Back to top */}
        <a
          href="#hero"
          id="footer-back-to-top"
          aria-label="Kembali ke atas halaman"
          className="inline-flex flex-col items-center gap-1 text-white/40 hover:text-white transition-colors duration-200 group mb-2"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 group-hover:border-white/50 transition-colors duration-200 text-xs"
          >
            ↑
          </span>
          <span className="text-xs font-medium tracking-wide">Kembali ke atas</span>
        </a>

        {/* Divider */}
        <div className="w-12 h-px bg-white/15" aria-hidden="true" />

        {/* Copyright */}
        <p id="footer-copyright" className="text-xs">
          © {currentYear} — Hak cipta dilindungi.
        </p>

        {/* Disclaimer — placeholder sesuai 02-content-data.md */}
        <p id="footer-disclaimer" className="text-xs max-w-xl leading-relaxed text-white/40">
          Informasi yang tersaji di website ini bersifat umum dan tidak menggantikan konsultasi medis langsung.
          Untuk keperluan medis, silakan hubungi dokter secara langsung.
        </p>

      </div>
    </footer>
  );
}
