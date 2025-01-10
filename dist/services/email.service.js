"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config/config");
class EmailService {
    static getTemplate(templateName) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../templates', `${templateName}.html`);
            return yield promises_1.default.readFile(templatePath, 'utf-8');
        });
    }
    static replaceTemplateVariables(template, variables) {
        return Object.entries(variables).reduce((acc, [key, value]) => acc.replace(new RegExp(`{{${key}}}`, 'g'), value), template);
    }
    static verifyConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.transporter.verify();
                console.log('SMTP connection verified successfully');
                return true;
            }
            catch (error) {
                console.error('SMTP connection verification failed:', error);
                return false;
            }
        });
    }
    static sendVerificationEmail(to, name, verificationToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const template = yield this.getTemplate('verifyEmail');
                const verificationLink = `${config_1.config.frontend.url}/verify-email?token=${verificationToken}`;
                const html = this.replaceTemplateVariables(template, {
                    name,
                    verificationLink,
                });
                const mailOptions = {
                    from: `"Your App" <${config_1.config.email.user}>`,
                    to,
                    subject: 'Verify Your Email',
                    html,
                };
                const info = yield this.transporter.sendMail(mailOptions);
                console.log('Verification email sent successfully:', info.messageId);
            }
            catch (error) {
                console.error('Error sending verification email:', error);
                throw new Error('Failed to send verification email');
            }
        });
    }
    static sendPasswordResetEmail(to, name, resetToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const template = yield this.getTemplate('resetPassword');
                const resetLink = `${config_1.config.frontend.url}/reset-password?token=${resetToken}`;
                const html = this.replaceTemplateVariables(template, {
                    name,
                    resetLink,
                });
                const mailOptions = {
                    from: `"Your App" <${config_1.config.email.user}>`,
                    to,
                    subject: 'Reset Your Password',
                    html,
                };
                const info = yield this.transporter.sendMail(mailOptions);
                console.log('Password reset email sent successfully:', info.messageId);
            }
            catch (error) {
                console.error('Error sending password reset email:', error);
                throw new Error('Failed to send password reset email');
            }
        });
    }
}
exports.EmailService = EmailService;
EmailService.transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: config_1.config.email.user,
        pass: config_1.config.email.pass,
    },
    debug: true,
    logger: true
});
