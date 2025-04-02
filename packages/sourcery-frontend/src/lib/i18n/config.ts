// Copyright (C) 2025 Jason Norwood-Young
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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