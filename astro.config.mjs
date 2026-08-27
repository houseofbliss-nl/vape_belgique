import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://vape24be.dealsnows.com",
  output: "static",
  compressHTML: true,
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes("/cart") &&
        !page.includes("/order-summary") &&
        !page.includes("/my-list"),
      // hreflang par langue dans le sitemap (SEO multilingue BE).
      i18n: {
        defaultLocale: "nl",
        locales: {
          nl: "nl-BE",
          fr: "fr-BE",
          de: "de-BE",
        },
      },
    }),
  ],
});
