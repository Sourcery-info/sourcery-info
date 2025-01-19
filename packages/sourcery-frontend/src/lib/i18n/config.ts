import { init, register, getLocaleFromNavigator } from 'svelte-i18n';
import { writable, derived } from 'svelte/store';

export type AppVersion = 'cloud' | 'private';

export const DEFAULT_LOCALE = 'en';

// Create a writable store for the app version
export const appVersionStore = writable<AppVersion>(import.meta.env.VITE_APP_VERSION as AppVersion || 'private');

// Create a derived store that will trigger i18n updates
export const appVersion = derived(appVersionStore, $version => $version);

// Function to change app version
export function setAppVersion(version: AppVersion) {
  appVersionStore.set(version);
  setupI18n(); // Reinitialize i18n with new version
}

function setupI18n({ withLocale: locale = DEFAULT_LOCALE } = {}) {
  register('en', () => import('./locales/en.json'));
  // We can add more languages here later
  // register('es', () => import('./locales/es.json'));

  init({
    fallbackLocale: DEFAULT_LOCALE,
    initialLocale: locale,
  });
}

// Initialize immediately for SSR
setupI18n();

export { setupI18n }; 