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
        // page est l'URL COMPLÈTE (ex. https://…com/ pour la racine).
        // La racine / fait un 301 → /nl/ (public/_redirects) : on l'exclut du
        // sitemap (elle portait noindex → c'était le message exact de Google).
        new URL(page).pathname !== "/" &&
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
