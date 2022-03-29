import { RemixI18Next } from "remix-i18next";
import { FileSystemBackend } from "remix-i18next";
import { createCookie } from 'remix'

// You will need to provide a backend to load your translations, here we use the
// file system one and tell it where to find the translations.
let backend = new FileSystemBackend("./public/locales");

export let i18n = new RemixI18Next(backend, {
  fallbackLng: "en", // here configure your default (fallback) language
  supportedLanguages: ["es", "en"], // here configure your supported languages
  cookie: createCookie('locale')
});