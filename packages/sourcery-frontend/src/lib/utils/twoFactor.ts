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

import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { hashPassword, checkPassword } from './crypto';

export class TwoFactorAuth {
    private static readonly APP_NAME = 'Sourcery.info';

    /**
     * Generate a new secret key for 2FA
     */
    static generateSecret(): string {
        return authenticator.generateSecret();
    }

    /**
     * Generate a QR code URL for the given secret
     */
    static async generateQRCode(email: string, secret: string): Promise<string> {
        const otpauth = authenticator.keyuri(email, this.APP_NAME, secret);
        return await QRCode.toDataURL(otpauth);
    }

    /**
     * Verify a TOTP token
     */
    static verifyToken(token: string, secret: string): boolean {
        return authenticator.verify({ token, secret });
    }

    /**
     * Generate backup codes and hash them
     */
    static async generateBackupCodes(count: number = 8): Promise<{ plainCodes: string[], hashedCodes: string[] }> {
        const plainCodes: string[] = [];
        const hashedCodes: string[] = [];
        
        for (let i = 0; i < count; i++) {
            const code = Math.random().toString(36).substr(2, 8).toUpperCase();
            plainCodes.push(code);
            // Hash each backup code
            hashedCodes.push(await hashPassword(code));
        }
        
        return { plainCodes, hashedCodes };
    }

    /**
     * Verify a backup code
     */
    static async verifyBackupCode(code: string, hashedCodes: string[]): Promise<{ isValid: boolean, index: number }> {
        for (let i = 0; i < hashedCodes.length; i++) {
            if (await checkPassword(code, hashedCodes[i])) {
                return { isValid: true, index: i };
            }
        }
        return { isValid: false, index: -1 };
    }
} 