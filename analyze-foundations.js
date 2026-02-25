/**
 * Analyze foundations for missing contact information
 * Reads the TypeScript config and identifies gaps
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// Read the foundations file
const foundationsPath = path.join(__dirname, 'src/lib/config/foundations/stiftungen-2026-02.ts');
const content = fs.readFileSync(foundationsPath, 'utf-8');

// Extract foundation objects using a simple regex approach
// This is fragile but works for our structured data
const foundationMatches = content.matchAll(/\{[\s\S]*?slug:\s*['"]([^'"]+)['"][\s\S]*?\}/g);

const results = {
  foundations: [],
  summary: {
    total: 0,
    missingEmail: 0,
    missingPhone: 0,
    missingAddress: 0,
    missingAny: 0,
  }
};

// Parse each foundation block
for (const match of foundationMatches) {
  const block = match[0];
  const slug = match[1];

  // Extract basic fields
  const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);
  const websiteMatch = block.match(/websiteUrl:\s*['"]([^'"]+)['"]/);
  const priorityMatch = block.match(/priority:\s*(\d+)/);
  const typeMatch = block.match(/type:\s*['"]([^'"]+)['"]/);

  // Extract contact fields
  const contactBlock = block.match(/contact:\s*\{([^}]*)\}/);
  const hasEmail = contactBlock && contactBlock[1].includes('email:');
  const hasPhone = contactBlock && contactBlock[1].includes('phone:');
  const hasAddress = contactBlock && contactBlock[1].includes('address:');
  const hasContact = !!contactBlock;

  const name = nameMatch ? nameMatch[1] : slug;
  const website = websiteMatch ? websiteMatch[1] : '';
  const priority = priorityMatch ? parseInt(priorityMatch[1]) : 4;
  const type = typeMatch ? typeMatch[1] : '';

  const missing = {
    email: !hasEmail,
    phone: !hasPhone,
    address: !hasAddress,
  };

  const missingAny = !hasEmail || !hasPhone || !hasAddress;

  if (missingAny) {
    results.foundations.push({
      slug,
      name,
      type,
      priority,
      website,
      hasContact,
      missing,
      missingFields: Object.keys(missing).filter(k => missing[k]),
    });

    results.summary.missingAny++;
    if (!hasEmail) results.summary.missingEmail++;
    if (!hasPhone) results.summary.missingPhone++;
    if (!hasAddress) results.summary.missingAddress++;
  }

  results.summary.total++;
}

// Sort by priority, then type
results.foundations.sort((a, b) => {
  if (a.priority !== b.priority) return a.priority - b.priority;
  return a.type.localeCompare(b.type);
});

// Output
console.log('=== Foundation Contact Analysis ===\n');
console.log(`Total foundations: ${results.summary.total}`);
console.log(`Missing any contact info: ${results.summary.missingAny}`);
console.log(`Missing email: ${results.summary.missingEmail}`);
console.log(`Missing phone: ${results.summary.missingPhone}`);
console.log(`Missing address: ${results.summary.missingAddress}`);
console.log('\n=== Foundations Missing Contact Info ===\n');

let currentPriority = -1;
for (const f of results.foundations) {
  if (f.priority !== currentPriority) {
    console.log(`\n--- Priority ${f.priority} ---`);
    currentPriority = f.priority;
  }
  console.log(`${f.slug} (${f.type})`);
  console.log(`  Name: ${f.name}`);
  console.log(`  Website: ${f.website}`);
  console.log(`  Missing: ${f.missingFields.join(', ')}`);
  console.log(`  Has contact block: ${f.hasContact}`);
}

// Save to JSON for processing
fs.writeFileSync(
  path.join(__dirname, 'foundations-missing-contacts.json'),
  JSON.stringify(results, null, 2)
);

console.log('\n\nResults saved to foundations-missing-contacts.json');
