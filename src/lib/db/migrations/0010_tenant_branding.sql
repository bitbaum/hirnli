-- Tenant visual identity becomes data.
--
-- `src/lib/config/branding.ts` hardcoded `logo.main: '/revampit-icon.png'` in a
-- file whose header called itself the SSOT for visual identity. Every tenant
-- therefore rendered under Revamp-IT's mark — evig's pages carried another
-- organisation's logo.
--
-- The rule: anything that varies per tenant is data. A logo varies.
--
-- `logoUrl` is a URL, not a bundled asset, because a platform cannot require a
-- customer to open a pull request to change their own logo. A relative path
-- still works for marks the platform happens to host today.

UPDATE org_profiles
   SET branding = branding || jsonb_build_object(
         'logoUrl', '/revampit-icon.png',
         'logoAlt', 'Revamp-IT Logo'
       ),
       updated_at = now()
 WHERE org_id = 'revamp-it';
--> statement-breakpoint

-- evig's own mark, served from evig's own site (/icon.png, 512×512, linked
-- from its <head>). Nothing invented: it is the icon evig already publishes.
UPDATE org_profiles
   SET branding = branding || jsonb_build_object(
         'logoUrl', 'https://evig.orangecat.ch/icon.png',
         'logoAlt', 'evig Logo'
       ),
       updated_at = now()
 WHERE org_id = 'evig';
