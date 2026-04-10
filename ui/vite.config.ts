import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Support both local dev (cwd=ui/) and CI/CD deploy (cwd=repo root)
const repoRoot = process.cwd().endsWith('/ui')
    ? path.resolve(process.cwd(), '..')
    : process.cwd();

export default defineConfig({
    plugins: [react()],
    envDir: repoRoot,
});
