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
import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';

// Get initial theme from localStorage or system preference
function getInitialTheme(): Theme {
    if (!browser) return 'light';
    
    // Match the blocking script's logic exactly
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function createThemeStore() {
    // Create store with synchronously retrieved initial value
    const initialTheme = getInitialTheme();
    const { subscribe, set } = writable<Theme>(initialTheme);

    return {
        subscribe,
        toggle: () => {
            if (!browser) return;
            
            const current = localStorage.getItem('theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            
            localStorage.setItem('theme', newTheme);
            document.documentElement.classList.toggle('dark', newTheme === 'dark');
            set(newTheme);
        },
        initialize: () => {
            if (!browser) return;
            
            const theme = getInitialTheme();
            localStorage.setItem('theme', theme);
            document.documentElement.classList.toggle('dark', theme === 'dark');
            set(theme);
        }
    };
}

export const theme = createThemeStore(); 