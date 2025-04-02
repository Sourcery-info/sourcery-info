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

export const alertMessages = {
    // Auth related
    'unauthorized': 'You are not authorized to access this page',
    'login-required': 'Please log in to access this page',
    'account-pending': 'Your account is pending approval',

    // Success messages
    'changes-saved': 'Changes have been saved successfully',
    'account-created': 'Account has been created successfully',

    // Error messages
    'operation-failed': 'Operation failed. Please try again',
    'invalid-input': 'Please check your input and try again',

    // Add more messages as needed
};

// Helper function to create alert URLs
export function createAlertUrl(baseUrl: string, alertCode: string, type = 'info') {
    const url = new URL(baseUrl, 'http://dummy.com'); // dummy.com is just for parsing
    url.searchParams.set('alert', alertCode);
    url.searchParams.set('type', type);
    return `${url.pathname}${url.search}`;
}