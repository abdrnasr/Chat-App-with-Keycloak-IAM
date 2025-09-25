import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
 
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals:true,
    coverage:{
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        "app/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
      ],
      exclude: [
        // exclude entire API auth folder and its children
        "app/api/auth/**",

        // exclude single utility files
        "lib/db.ts",
        "lib/types.ts",

        // exclude all visual sub-components
        "app/components/**", // Comment this to fail the test

        // exclude boilerplate layout
        "app/layout.tsx",
      ],
      // Uncomment this to set failure thresholds
      thresholds: {  
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90
      }
    },
  },  
})