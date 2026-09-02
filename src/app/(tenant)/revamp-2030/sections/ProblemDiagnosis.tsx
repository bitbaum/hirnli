import Card from '@/components/ui/Card';
import { REPAIR_TABLES_CURRENT } from '@/lib/config/projections';
import Callout from '@/components/ui/Callout';

export default function ProblemDiagnosis() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">
        Das eigentliche Problem: Nicht Raum, sondern Organisation
      </h2>
      <Card className="border-l-4 border-l-danger bg-danger/10">
        <div className="flex items-start gap-4">
          <span className="text-4xl flex-shrink-0" aria-hidden="true">
            ⚠️
          </span>
          <div className="flex-1">
            <h3 className="heading-card font-bold text-danger mb-3">
              Unsere Kapazitäts-Grenzen (ehrliche Diagnose)
            </h3>
            <div className="space-y-4 text-sm text-danger">
              <div>
                <p className="heading-detail text-danger mb-2">
                  Hardware-Refurbishment: Potential nicht ausgeschöpft
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>{REPAIR_TABLES_CURRENT} Reparaturtische vorhanden</strong> — Kapazität
                    für paralleles Arbeiten ist da
                  </li>
                  <li>
                    Engagiertes Team: Praktikanten, Freiwillige, Reintegrations-Mitarbeiter
                    (GEP-Programm)
                  </li>
                  <li>
                    <strong>Fehlende Ressource:</strong> Bezahlte Fachperson für
                    Prozess-Organisation und Koordination
                  </li>
                  <li>
                    Lagerkapazität vorhanden, aber <strong>Optimierungspotential</strong> bei der
                    Organisation
                  </li>
                  <li>
                    <strong>Bedarf:</strong> Systematisches Training & standardisierte Workflows zur
                    Skalierung
                  </li>
                  <li>
                    Sozialpädagogische Begleitung läuft gut, könnte aber als{' '}
                    <strong>strukturiertes Programm</strong> professionalisiert werden
                  </li>
                  <li>
                    Multi-Tasking (Reparatur + Kundenservice) funktioniert, ist aber nicht optimal
                    für Spezialisierung
                  </li>
                  <li>
                    <strong>
                      Resultat: Wir könnten mehr Output erreichen mit dedizierter Prozess-Leitung
                    </strong>
                  </li>
                </ul>
              </div>

              <div>
                <p className="heading-detail text-danger mb-2">
                  Software/AI: Gute Fortschritte, aber zeitliche Engpässe
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Web-Entwicklung läuft aktiv — Team arbeitet fokussiert an internen Systemen
                    (Kivitendo-Integration, Datenerfassung)
                  </li>
                  <li>
                    Effizienz-Systeme werden entwickelt (automatische Erfassung, Prozessoptimierung)
                  </li>
                  <li>
                    Fundraising-Infrastruktur wird aufgebaut (diese Plattform, Stiftungs-Research)
                  </li>
                  <li>
                    <strong>Zeitkonflikt:</strong> Operatives Tagesgeschäft vs. Bildungsprogramme
                    (Workshops, AI-Kurse, Open-Source-Education)
                  </li>
                  <li>
                    <strong>Fehlende Ressource:</strong> Dedizierte Bildungsleitung, die parallel
                    zum Dev-Team arbeitet
                  </li>
                </ul>
              </div>

              <Callout color="danger" className="my-3">
                <p className="font-bold text-danger mb-1">Die Kernherausforderung:</p>
                <p className="text-danger">
                  Unser Team leistet <strong>hervorragende Arbeit</strong>, aber die Kapazität ist
                  begrenzt. Wir haben <strong>ungenutzte Infrastruktur</strong> (Tische, Raum,
                  Tools), aber{' '}
                  <strong>
                    keine bezahlten Fachleute, die ausschliesslich Programme entwickeln,
                    organisieren und skalieren
                  </strong>
                  . Mehr Raum allein löst das nicht — wir brauchen{' '}
                  <strong>dedizierte Bildungs- & Prozessleitung</strong>.
                </p>
              </Callout>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
