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