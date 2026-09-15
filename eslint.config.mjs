import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // 'detect' hits ESLint 10's removed context.getFilename() inside
    // eslint-plugin-react — pin the version instead (same fix as orangecat).
    settings: { react: { version: '19.2.8' } },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
  },
  // The app's own code does not print to the console.
  //
  // A quality sweep read this repo as carrying 504 `console.log` calls and
  // called it the fleet's worst debug noise. Every one of them is in
  // `scripts/` — operator CLIs whose whole output IS stdout, where a log line
  // is the feature. `src/` had zero, and the only reason that is true is that
  // nobody has added one yet.
  //
  // So the rule is scoped to where it is actually a defect: a server component
  // logging to a console no operator reads, or a client component printing a
  // customer's data into their browser. `warn` and `error` stay allowed —
  // those are diagnostics a running server is expected to emit, and
  // `apiError()` in lib/api/route-helpers.ts is built on one.
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  // Pipeline/migration scripts — relax any-type rule.
  // These one-off scripts manipulate JSONB blobs where exact types aren't needed.
  {
    files: ['scripts/**/*.ts', 'src/scripts/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Legacy JS scripts using CommonJS require() — exclude from ESM import rule.
  {
    files: ['src/scripts/**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Auto-generated file — never lint
    'src/lib/config/foundations/stiftungen-generated.ts',
    // Sibling checkouts, not this branch's code.
    //
    // Concurrent sessions each get a git worktree under .claude/worktrees/, and
    // ESLint walked into them: `pnpm lint` on a clean tree reported five
    // warnings whose file paths did not exist in it, and time was spent hunting
    // for code that was on somebody else's branch. Whatever is wrong in another
    // worktree is that branch's lint run to fail, not this one's.
    '.claude/worktrees/**',
  ]),
]);

export default eslintConfig;
