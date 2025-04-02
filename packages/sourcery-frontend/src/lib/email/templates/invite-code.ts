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

export default {
    subject: 'Invitation to join {{appName}}',
    text: `
Hello,

You have been invited to join {{appName}}. 

Your invite code is: {{inviteCode}}

To create your account, please visit:
{{signupUrl}}

This invite code will expire in 7 days.

Best regards,
The {{appName}} Team
`,
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4F46E5;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
        .code {
            background-color: #F3F4F6;
            padding: 12px;
            border-radius: 6px;
            font-family: monospace;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <h2>Welcome to {{appName}}</h2>
    
    <p>You have been invited to join {{appName}}.</p>
    
    <p>Your invite code is:</p>
    <div class="code">{{inviteCode}}</div>
    
    <p>Click the button below to create your account:</p>
    <a href="{{signupUrl}}" class="button">Create Account</a>
    
    <p>Or copy and paste this URL into your browser:</p>
    <p>{{signupUrl}}</p>
    
    <p>This invite code will expire in 7 days.</p>
    
    <p>Best regards,<br>The {{appName}} Team</p>
</body>
</html>
`
}; 