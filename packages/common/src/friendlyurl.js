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

/**
 * Converts a string to a friendly URL format.
 * @param {string} str - The input string to be converted.
 * @returns {string} - The converted string in a friendly URL format.
 */
export default function friendlyURL(str) {
    return str.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Increments a name by appending a number to it.
 * If the name already ends with a number, the number is incremented by 1.
 * If the name does not end with a number, `-1` is appended to the name.
 * @param {string} name - The name to be incremented.
 * @returns {string} - The incremented name.
 */
export function incrementName(name) {
    const nameParts = name.split('-');
    const lastPart = nameParts.pop() || '';
    const number = parseInt(lastPart, 10);
    if (isNaN(number)) {
        nameParts.push(lastPart);
        nameParts.push('1');
    } else {
        nameParts.push(`${number + 1}`);
    }
    return nameParts.join('-');
}

/**
 * Increments the filename by appending a number to the base name and preserving the file extension.
 * @param {string} filename - The original filename.
 * @returns {string} - The incremented filename.
 */
export function incrementFilename(filename) {
    const parts = filename.split('.');
    const ext = parts.pop();
    const name = parts.join('.');
    return `${incrementName(name)}.${ext}`;
}