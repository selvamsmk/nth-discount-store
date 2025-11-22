import { defineConfig } from 'vitest/config'
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { playwright } from '@vitest/browser-playwright'
import react from '@vitejs/plugin-react'
import path from "node:path";

export default defineConfig({
  plugins: [tailwindcss(), tanstackRouter(), react()],
  resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      // https://vitest.dev/config/browser/playwright
      instances: [
        { browser: 'chromium' },
      ],
    },
  },
})
