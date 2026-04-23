import Card from '@/components/ui/Card';
import { TEAM_MEMBERS } from '@/app/team/data';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { formatCHF } from '@/lib/utils/format';
import {
  REVENUE_PEAK_DISPLAY,
  REVENUE_CURRENT_DISPLAY,
  REVENUE_PEAK_YEAR,
} from '@/lib/config/projections';
import {
  THREE_YEAR_MODEL,
  REVENUE_YEAR3_TOTAL,
  REDUCTION_PCT,
  PROJECT_START,
  SERVICES_PEAK_DISPLAY,
  SERVICES_CURRENT_DISPLAY,
} from '../data';

export default function WhyWeNeedFunding() {
  return (
    <section className="mb-8">
      <Card className="border-l-4 border-l-primary bg-primary/10">
        <div className="prose prose-sm max-w-none">
          <h2 className="text-xl font-bold text-primary mt-0">Die Situation: Warum wir Stiftungen brauchen</h2>

          <p className="text-grey-dark leading-relaxed">
            Seit {ORG_PROFILE.founded} reparieren und verkaufen wir refurbished Computer. <strong>Aber unser aktuelles Geschäftsmodell ist nicht nachhaltig.</strong>
          </p>

          <p className="text-grey-dark leading-relaxed">
            <strong>Die Herausforderung:</strong> Unsere Einnahmen sind von {REVENUE_PEAK_DISPLAY} ({REVENUE_PEAK_YEAR.year}) auf {REVENUE_CURRENT_DISPLAY} (2025) gefallen — B2B-Hosting-Kunden verloren,
            Dienstleistungen von {SERVICES_PEAK_DISPLAY} auf {SERVICES_CURRENT_DISPLAY} geschrumpft. Das aktuelle Modell — abhängig von wenigen Einzelkunden — ist fragil.
          </p>

          <p className="text-grey-dark leading-relaxed">
            <strong>Das eigentliche Problem:</strong> Nicht fehlende Refurbishment-Kapazität, sondern <strong>fehlende Organisation
            für Verkauf und Ausführung</strong>. Wir haben bereits zu viel Inventar in 2 Lagern. Viele Organisationen in Zürich
            entsorgen alte Technologie — aber wir brauchen keine zusätzlichen Geräte, sondern bessere Prozesse.
          </p>

          <div className="bg-warning/10 border-l-4 border-warning p-4 my-4">
            <p className="text-warning font-semibold mb-2">Das Problem in einem Satz:</p>
            <p className="text-warning mb-0">
              Wir haben {TEAM_MEMBERS.length} Menschen im Team (Techniker, Betrieb, Leitung) — aber zu wenig bezahlte Kapazität und keine
              dedizierte Bildungsstruktur, um Prozesse zu professionalisieren und das volle Potenzial auszuschöpfen.
              <br /><span className="text-xs mt-1 block">Leitung: Andreas, Veronica (Sozialpädagogin), Dani. Technik & Betrieb: Freiwillige, Praktikanten, Reintegrations-Teilnehmer.</span>
            </p>
          </div>

          <h3 className="text-lg font-bold text-primary mt-6">Die Lösung: Professionalisierung + Bildung + Community</h3>

          <p className="text-grey-dark leading-relaxed">
            Statt nur Refurbishment zu skalieren, wollen wir unser Modell <strong>transformieren</strong>:
          </p>

          <ul className="text-grey-dark space-y-2">
            <li>
              <strong>Professionelle Prozesse:</strong> 2 Bildungsprogrammleiter organisieren Refurbishment-Workflows,
              bilden Techniker aus (mit sozialpädagogischer Begleitung durch Veronica)
            </li>
            <li>
              <strong>Tech-Bildung & AI Lab:</strong> Nicht nur Geräte reparieren, sondern Menschen befähigen.
              AI-Souveränität durch eigene GPUs (gespendet oder gekauft — verschiedene Setups möglich, siehe Hub-Details)
            </li>
            <li>
              <strong>Community Hub:</strong> Ein Ort für Kreislaufwirtschaft, Makerspace, Tech-Kultur — wo Menschen
              nicht nur konsumieren, sondern lernen und gestalten
            </li>
          </ul>

          <p className="text-grey-dark leading-relaxed">
            <strong>Warum Stiftungen?</strong> Weil wir eine soziale Mission haben, keine Silicon-Valley-Startup-Mentalität.
            Wir arbeiten mit Reintegrations-Programmen (z.B. GEP), Freiwilligen, Praktikanten. Professionalisierung braucht
            Ressourcen — und die kommen nicht aus Verkaufserlösen allein.
          </p>

          <h3 className="text-lg font-bold text-primary mt-6">Was wir von Stiftungen brauchen</h3>

          <p className="text-grey-dark leading-relaxed mb-0">
            Wir brauchen <strong>Anschubfinanzierung für 3 Jahre</strong>, um Hub + Team aufzubauen.
            Danach sind wir selbsttragend (Operations durch Revenue finanziert).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 not-prose">
            {THREE_YEAR_MODEL.map((year, i) => {
              const stiftungenAmt = year.stiftungen + year.einmalig;
              const stiftungenPct = Math.round((stiftungenAmt / year.total) * 100);
              const colors = [
                { border: 'border-primary/20', text: 'text-primary', bold: 'text-primary' },
                { border: 'border-pillar-vision/20', text: 'text-pillar-vision', bold: 'text-pillar-vision' },
                { border: 'border-success/20', text: 'text-success', bold: 'text-success' },
              ];
              const labels = ['Aufbau: Hub-Einrichtung + Team-Rekrutierung', 'Wachstum: Revenue steigt, Stiftungen sinken', `Verselbständigung: Revenue ${formatCHF(REVENUE_YEAR3_TOTAL)}, Operations zunehmend selbsttragend`];
              return (
                <div key={year.year} className={`bg-white rounded-lg p-4 border-2 ${colors[i].border}`}>
                  <div className={`text-sm ${colors[i].text} font-semibold`}>{year.year} ({PROJECT_START + i})</div>
                  <div className={`text-2xl font-bold ${colors[i].bold} my-2`}>{formatCHF(stiftungenAmt)}</div>
                  <div className="text-xs text-text-light">{stiftungenPct}% von Stiftungen<br/>{labels[i]}</div>
                </div>
              );
            })}
          </div>

          <p className="text-grey-dark leading-relaxed mt-4 mb-0">
            <strong>Degressives Modell:</strong> Je mehr wir wachsen, desto weniger Stiftungsgelder brauchen wir.
            Jahr 1 → Jahr 3: <strong>-{REDUCTION_PCT}% weniger Stiftungsgelder</strong>. Ab Jahr 4: Nur noch Impact-Finanzierung
            (kostenlose Geräte, Stipendien), keine Betriebskosten mehr.
          </p>
        </div>
      </Card>
    </section>
  );
}
