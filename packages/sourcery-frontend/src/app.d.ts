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

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { Session } from "$lib/server/auth";
import type { User } from "$lib/server/user";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: Session | null;
			user: User | null;
			alerts: Array<{
				type: string;
				message: string;
			}>
			config: {
				[key: string]: string;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
