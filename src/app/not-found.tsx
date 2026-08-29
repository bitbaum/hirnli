import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="heading-section mb-3">Seite nicht gefunden</h2>
      <p className="text-text-secondary mb-6 max-w-md">
        Die angeforderte Seite existiert nicht oder wurde verschoben.
      </p>
      <Button href="/" variant="soft">
        Zur Startseite
      </Button>
    </div>
  );
}
