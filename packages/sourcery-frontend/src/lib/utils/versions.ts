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

export function incrementVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
	const parts = version.replace('v', '').split('.');
	const major = parseInt(parts[0]) || 0;
	const minor = parseInt(parts[1]) || 0;
	const patch = parseInt(parts[2]) || 0;
	if (type === 'major') {
		return `v${major + 1}.0.0`;
	} else if (type === 'minor') {
		return `v${major}.${minor + 1}.0`;
	} else {
		return `v${major}.${minor}.${patch + 1}`;
	}
}