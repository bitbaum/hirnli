import { BRAND_NAME } from '@/lib/config/nav';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-bg-light">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-text-light">
        <p>{BRAND_NAME} &copy; {currentYear} &ndash; Interne Wissensbasis von Revamp-IT</p>
        <div className="mt-2 flex justify-center gap-4">
          <a
            href="https://github.com/g-but/revamp-info"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            GitHub
          </a>
          <a
            href="https://revampit.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            Hauptseite
          </a>
          <a
            href="https://revampit.vercel.app/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
}
