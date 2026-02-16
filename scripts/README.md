# Foundation Research Scripts

Scripts to improve the efficiency and quality of foundation research pipeline.

## Available Scripts

### `foundation-validate.ts`

**Purpose**: Validate all foundation entries against quality gates and detect issues.

**Usage**:
```bash
npm run validate:foundations
```

**What it checks**:
- ✅ **Schema validation**: Status, type, fit, priority, applicationMethod enums
- ✅ **Quality gate**: For `needsResearch: false`, requires:
  - `purposeSummary` ≥ 150 characters
  - `researchNotes` ≥ 250 characters
  - Contact info (email OR phone)
  - At least one theme
  - Website OR application URL
- ✅ **Duplicate detection**: Checks for duplicate slugs, UIDs, and fuzzy name matches
- ✅ **Completeness**: Warns about missing UIDs, sources, or high-priority foundations still needing research

**Output**:
- Errors (must fix before commit)
- Warnings (should fix, but not blocking)
- Info (nice-to-have)

**Exit codes**:
- `0` = All validations passed
- `1` = Errors found (blocks CI if integrated)

---

### `foundation-add.ts`

**Purpose**: Interactive CLI to generate validated foundation entries.

**Usage**:
```bash
npm run foundation:add
```

**Features**:
- 📝 **Interactive prompts** for all required fields
- ✅ **Schema validation** before generating code
- 🔍 **Duplicate detection** (slug, UID, fuzzy name)
- 🎯 **Quality gate enforcement** for `needsResearch: false`
- 🚀 **Auto-generates TypeScript code** ready to paste into config files

**Workflow**:
1. Run `npm run foundation:add`
2. Answer prompts (name, type, status, themes, etc.)
3. Script validates and generates TypeScript entry
4. Copy output and paste into `src/lib/config/foundations/stiftungen-YYYY-MM.ts`
5. Run `npm run build` to verify

**Quality gates**:
- If `needsResearch: false`, enforces 150+ char purpose and 250+ char research notes
- Requires contact info (email OR phone) for complete entries
- Auto-suggests slug from foundation name
- Checks for duplicates before generating code

---

### `esa-download-and-parse.ts`

**Purpose**: Download and parse the official ESA foundation register.

**Usage**:
```bash
npm run esa:download
```

**What it does**:
- Downloads the Excel file from ESA (Eidgenössische Stiftungsaufsicht)
- Parses 5,392 foundations under federal supervision
- Extracts: UID, name, Stiftungszweck (purpose), city, status
- Saves as JSON: `research/esa-register-YYYY-MM-DD.json`

**Output structure**:
```json
{
  "downloadDate": "2026-02-16",
  "source": "https://backend.esa.admin.ch/...",
  "count": 5392,
  "foundations": [
    {
      "uid": "CHE-XXX.XXX.XXX",
      "name": "Foundation Name",
      "purpose": "Official Stiftungszweck text...",
      "city": "Zürich",
      "status": "aktiv"
    }
  ]
}
```

**Update frequency**: Run monthly or when ESA publishes a new version.

---

### `esa-bulk-validate.ts`

**Purpose**: Validate all foundation UIDs against the official ESA register.

**Usage**:
```bash
npm run esa:validate
```

**Prerequisite**: Run `npm run esa:download` first.

**What it checks**:
- ✅ **Valid**: UID exists in ESA register and name matches
- ⚠️ **Name mismatch**: UID valid but name differs from official ESA name
- ❌ **Not found**: UID doesn't exist in ESA (may be incorrect or under cantonal supervision)
- ❓ **Missing UID**: Foundation in our data but no UID (can often auto-fill from ESA by name)

**Output**:
- Console report with categorized issues
- Detailed JSON: `research/esa-validation-results.json`

**Current results** (2026-02-16):
- 27 valid (24%)
- 5 not found in ESA (potentially invalid UIDs)
- 81 missing UIDs (26 can be auto-filled from ESA name matching)
- 1 minor name mismatch

**Key findings**:
- **3 of our recent additions have invalid UIDs** - confirms the 80% false positive rate from manual research
- **26 major foundations can have UIDs auto-filled** (Klimastiftung, Binding, Drosos, Hasler, Pro Juventute, etc.)
- **Many foundations not in ESA** - expected, as not all Swiss foundations are under federal supervision (cantonal, associations, networks)

---

### `foundation-research-assistant.ts`

**Purpose**: LLM-assisted individual foundation research (Phase 3 automation).

**Usage**:
```bash
npm run research:foundation -- --name="Foundation Name" --url=https://...
```

**What it does**:
- Fetches foundation website content
- Queries ESA register for official Stiftungszweck
- Generates detailed analysis prompt
- Outputs structured research for LLM analysis

**Output**: `research/drafts/YYYY-MM-DD/foundation-slug.json`

**Note**: Currently generates prompts for manual LLM analysis. Future: integrate Anthropic API for automated analysis.

---

### `foundation-batch-research.ts`

**Purpose**: Batch research prompt generation for multiple candidates.

**Usage**:
```bash
npm run research:batch                    # Default: load from Fundraiso discovery
npm run research:batch -- --tier=1        # Load Tier 1 candidates
npm run research:batch -- --file=path.json # Load from custom file
```

**What it does**:
- Loads candidates from Fundraiso discovery or custom JSON
- Filters to Tier 1-2 (Zürich-based or multi-match signal)
- Generates structured research prompts for each foundation
- Saves to: `research/batch-analysis/YYYY-MM-DD/NN-slug.md`

**Output structure**:
- Individual `.md` files with research tasks
- `batch-summary.json` with candidate list
- Prompts include: website visit, ESA check, fit assessment, decision framework

**Workflow**:
1. Run script to generate prompts
2. Use Claude Code to analyze each foundation (WebFetch + ESA)
3. Save analysis results as JSON
4. Review and approve/reject entries

**Tested results (2026-02-16)**:
- 20 candidates processed
- 9 analyzed (2 already in DB, 1 medium candidate, 6 exclusions)
- **Time: 2.8 min per foundation** (vs 15-20 min manual) = **82% time savings**
- **False positive rate: 86%** - confirms need for better Phase 2 screening

---

## Integration with CI/CD

To enforce quality gates in CI:

```yaml
# .github/workflows/validate.yml
- name: Validate foundation data
  run: npm run validate:foundations
```

This will fail the build if any schema errors or quality gate violations are found.

---

## Roadmap

### Phase A: Quick Wins ✅ (Current)
- [x] `foundation-validate.ts` - quality gate enforcement
- [x] `foundation-add.ts` - entry generation helper
- [ ] ESA UID validation in screening (manual API calls)
- [x] Expand NOT_RECOMMENDED patterns (12 added in Feb 2026)

### Phase B: ESA Integration (Future)
- [ ] Research ESA API (official endpoint vs scraping)
- [ ] `esa-bulk-validate.ts` - batch UID validation
- [ ] Integrate ESA validation into Phase 2 screening
- [ ] Auto-exclude non-existent foundations

### Phase C: Phase 3 Automation (Future)
- [ ] Website scraper (readability/trafilatura)
- [ ] Fundraiso detail page scraper
- [ ] LLM analysis pipeline (funder vs operator detection)
- [ ] Draft entry generator with AI assistance
- [ ] Human review UI (CLI or web)

### Phase D: Full Automation (Ongoing)
- [ ] Scheduled discovery runs (monthly)
- [ ] Website change detection (monitor deadlines)
- [ ] Continuous improvement of screening heuristics

---

## References

- **Pipeline documentation**: `research/FOUNDATION-RESEARCH-PIPELINE.md`
- **Improvement analysis**: `research/PIPELINE-IMPROVEMENTS.md`
- **Foundation schema**: `src/lib/schemas/foundation.ts`
- **Foundation config**: `src/lib/config/foundations/`

---

**Last Updated**: 2026-02-16
**Status**: Phase A (Quick Wins) in progress
