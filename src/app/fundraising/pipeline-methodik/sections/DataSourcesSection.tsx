import Card from '@/components/ui/Card';
import { SWISS_FOUNDATIONS_DISPLAY } from '@/lib/config/projections';

export default function DataSourcesSection() {
  return (
    <section className="mb-10">
      <h2 className="mb-4 heading-subsection">Datenquellen</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="mb-2 heading-item">Zefix (Handelsregister)</h3>
          <p className="mb-2 text-sm text-text-light">
            Offizielles Schweizer Handelsregister. Enthält alle eingetragenen Stiftungen
            mit Name, UID und Sitz. Keine Informationen über Stiftungszweck oder Tätigkeit.
          </p>
          <p className="text-sm text-text-muted">{SWISS_FOUNDATIONS_DISPLAY} Stiftungen. Quelle: zefix.ch</p>
        </Card>
        <Card>
          <h3 className="mb-2 heading-item">ESA (Eidg. Stiftungsaufsicht)</h3>
          <p className="mb-2 text-sm text-text-light">
            Bundesaufsicht über Stiftungen. Enthält den offiziellen Stiftungszweck —
            die rechtliche Zweckbeschreibung, die bei der Gründung festgelegt wurde.
            Dies ist unser wichtigstes Signal für die Erstbewertung.
          </p>
          <p className="text-sm text-text-muted">~5&apos;400 Stiftungen mit Zwecktext. Quelle: esa.admin.ch</p>
        </Card>
      </div>
    </section>
  );
}
