import { i18n } from '$lib/i18n/setup';

export const load = async () => {
  await i18n.waitLocale();
  return {};
}; 