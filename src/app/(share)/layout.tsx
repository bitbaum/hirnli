/**
 * Share chrome — NONE by design. Foundation officers following a share link
 * get a clean, read-only presentation: no internal nav, no pipeline links,
 * no toolbar (the share contract in CLAUDE.md).
 */

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      {children}
    </main>
  );
}
