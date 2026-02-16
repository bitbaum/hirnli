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
