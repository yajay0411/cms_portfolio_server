"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const config_1 = tslib_1.__importDefault(require("../config/config"));
const mail_1 = tslib_1.__importDefault(require("@sendgrid/mail"));
const fs_extra_1 = require("fs-extra");
const handlebars_1 = tslib_1.__importDefault(require("handlebars"));
const mjml_1 = tslib_1.__importDefault(require("mjml"));
mail_1.default.setApiKey(config_1.default.SEND_GRID_API_SECRET);
exports.default = {
    sendEmail: async (to, subject, html) => {
        const msg = {
            to,
            from: config_1.default.EMAIL_FROM,
            subject,
            html
        };
        await mail_1.default.send(msg);
    },
    renderTemplate: async (templateName, data) => {
        const filePath = path_1.default.join(__dirname, '../templates/email_templates', `${templateName}.mjml`);
        const mjmlSource = await (0, fs_extra_1.readFile)(filePath, 'utf-8');
        const compiled = handlebars_1.default.compile(mjmlSource);
        const mjmlWithData = compiled(data);
        const { html, errors } = (0, mjml_1.default)(mjmlWithData);
        if (errors.length > 0) {
            throw new Error(`MJML compilation failed: ${JSON.stringify(errors)}`);
        }
        return html;
    }
};
//# sourceMappingURL=emailService.js.map