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