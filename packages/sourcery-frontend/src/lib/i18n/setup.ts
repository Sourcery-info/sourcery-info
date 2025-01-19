import { browser } from '$app/environment';
import { setupI18n } from './config';
import { waitLocale } from 'svelte-i18n';

// Initialize i18n
setupI18n();

// Export for use in load functions
export const i18n = {
  waitLocale
};

// You can add more i18n setup logic here in the future 