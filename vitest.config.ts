import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    // Sibling checkouts, not this branch's tests.
    //
    // Concurrent sessions each get a git worktree under .claude/worktrees/, and
    // Vitest's default include walks into them: this checkout has 53 test
    // files, and a run was reporting 207. So a green run meant "this branch
    // and whatever three other branches happen to be checked out are green",
    // and a broken test on someone else's branch fails yours. ESLint had the
    // same problem and is excluded the same way in eslint.config.mjs.
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.claude/worktrees/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
