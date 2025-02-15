import nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';
import Handlebars from 'handlebars';
import type { TemplateDelegate as HandlebarsTemplateDelegate } from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

interface MailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    defaultFrom?: string;
    templatesDir?: string;
}

export class MailService {
    private transporter: nodemailer.Transporter | null = null;
    private config: MailConfig;
    private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

    constructor(config: Partial<MailConfig> = {}) {
        this.config = {
            ...config,
            host: config.host || '127.0.0.1',
            port: config.port || 587,
            secure: config.secure ?? false,
            auth: config.auth || { user: '', pass: '' },
            defaultFrom: config.defaultFrom || config.auth?.user || '',
            templatesDir: config.templatesDir || path.join(process.cwd(), 'src/lib/email/templates')
        };
    }

    private async getTransporter(): Promise<nodemailer.Transporter> {
        if (!this.transporter) {
            this.transporter = nodemailer.createTransport(this.config);
            
            // Verify connection configuration
            try {
                await this.transporter.verify();
            } catch (error) {
                console.error('Failed to create mail transporter:', error);
                throw error;
            }
        }
        return this.transporter;
    }

    /**
     * Sends an email using the configured SMTP server
     * @param options The email options including from, to, subject, and content
     * @returns Promise that resolves when the email is sent
     */
    public async sendMail(options: SendMailOptions): Promise<void> {
        try {
            const transporter = await this.getTransporter();
            await transporter.sendMail({
                ...options,
                from: options.from || this.config.defaultFrom
            });
        } catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }

    /**
     * Sends an HTML email
     * @param to Recipient email address
     * @param subject Email subject
     * @param html HTML content
     * @param from Optional sender email address
     */
    public async sendHtmlMail(
        to: string | string[],
        subject: string,
        html: string,
        from?: string
    ): Promise<void> {
        await this.sendMail({
            to,
            subject,
            html,
            from
        });
    }

    /**
     * Sends a plain text email
     * @param to Recipient email address
     * @param subject Email subject
     * @param text Plain text content
     * @param from Optional sender email address
     */
    public async sendTextMail(
        to: string | string[],
        subject: string,
        text: string,
        from?: string
    ): Promise<void> {
        await this.sendMail({
            to,
            subject,
            text,
            from
        });
    }

    /**
     * Loads and compiles an email template
     * @param templateName Name of the template file (without extension)
     * @returns Compiled template function
     */
    private async loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
        if (this.templates.has(templateName)) {
            return this.templates.get(templateName)!;
        }

        const templatePath = path.join(this.config.templatesDir!, `${templateName}.hbs`);
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const template = Handlebars.compile(templateContent);
        this.templates.set(templateName, template);
        return template;
    }

    /**
     * Sends an email using a template
     * @param to Recipient email address
     * @param subject Email subject
     * @param templateName Name of the template file (without extension)
     * @param context Data to be passed to the template
     * @param from Optional sender email address
     */
    public async sendTemplateEmail(
        to: string | string[],
        subject: string,
        templateName: string,
        context: Record<string, any>,
        from?: string
    ): Promise<void> {
        try {
            const template = await this.loadTemplate(templateName);
            const html = template(context);
            await this.sendHtmlMail(to, subject, html, from);
        } catch (error) {
            console.error(`Failed to send template email (${templateName}):`, error);
            throw error;
        }
    }
}
