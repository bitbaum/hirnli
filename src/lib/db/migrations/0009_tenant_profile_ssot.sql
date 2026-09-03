-- Tenant identity becomes the single source of truth, and stops storing what
-- it can derive.
--
-- Two problems in the seeded revamp-it row:
--
--   1. `yearsActive` and `experienceLabel` were STORED next to `founded`. They
--      are arithmetic on `founded`, not facts. They matched the code only
--      because the year is 2026 — on 1 January the row says 23 while the code
--      computes 24, and nothing fails loudly. Removed; derived on read by
--      src/lib/tenant/profile.ts.
--
--   2. evig's row was seeded empty, so it could not act as a tenant at all.
--      Populated from evig's own published Impressum and About page — every
--      value below is quoted from the live site, none invented:
--        legal form  "Verein nach Art. 60 ff. ZGB"        (/impressum)
--        founded     "evig entstand 2026 in Zürich"        (/about)
--        location    "Zürich, Schweiz"                     (/impressum)
--        email       butaeff@gmail.com                     (/impressum)
--        contact     "Der Vorstand"                        (/impressum)
--        purpose     the Zweck paragraph                   (/impressum)
--      Fields evig has not published (postal address, phone, tax exemption)
--      are LEFT ABSENT rather than guessed — the schema marks them optional so
--      the UI can say "not stated" honestly.

-- 1. Drop the derived values from every tenant that has them.
UPDATE org_profiles
   SET profile = profile - 'yearsActive' - 'experienceLabel',
       updated_at = now()
 WHERE profile ? 'yearsActive' OR profile ? 'experienceLabel';
--> statement-breakpoint

-- 2. Seed evig's identity. Merged rather than replaced, so re-running is safe
--    and any manual edit made in the meantime survives.
UPDATE org_profiles
   SET profile = profile || jsonb_build_object(
         'orgId',           'evig',
         'name',            'evig',
         'legalForm',       'Verein nach Art. 60 ff. ZGB',
         'founded',         2026,
         'location',        'Zürich',
         'website',         'https://evig.orangecat.ch',
         'siteUrl',         'https://evig.orangecat.ch',
         'email',           'butaeff@gmail.com',
         'contactName',     'Der Vorstand',
         'missionSummary',  'Zugang zu Intelligenz bezahlbar machen — kuratierte Technik, KI und Robotik, faire Reparatur und ein Kreislauf-Marktplatz',
         'missionKeywords', jsonb_build_array('Kreislaufwirtschaft', 'KI-Zugang', 'Reparatur', 'Umschulung'),
         'missionAreas',    jsonb_build_array(
           jsonb_build_object(
             'name',        'Kuratierte Technik',
             'description', 'Geprüfte, eingerichtete Geräte zu fairen Preisen statt Ramsch',
             'metrics',     jsonb_build_array('Kreislauf-Marktplatz für Kauf, Verkauf und Reparatur')
           ),
           jsonb_build_object(
             'name',        'Faire Reparatur',
             'description', 'Technikerinnen und Techniker in der Nähe über die IT-Hilfe finden',
             'metrics',     jsonb_build_array('Vermittlung statt Wegwerfen')
           ),
           jsonb_build_object(
             'name',        'KI-Zugang und Umschulung',
             'description', 'KI und Robotik in Betriebe bringen, und Umschulung für eine Arbeitswelt mit KI',
             'metrics',     jsonb_build_array('Begleitung von Organisationen und Betrieben')
           )
         )
       ),
       updated_at = now()
 WHERE org_id = 'evig';
