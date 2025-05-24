import path from 'path'
import config from '../config/config'
import sgMail from '@sendgrid/mail'
import { readFile } from 'fs-extra'
import handlebars from 'handlebars'
import mjml2html from 'mjml'

sgMail.setApiKey(config.SEND_GRID_API_SECRET!)

export default {
  sendEmail: async (to: string[], subject: string, html: string) => {
    try {
      const msg = {
        to,
        from: config.EMAIL_FROM!,
        subject,
        html
      }

      await sgMail.send(msg)
    } catch (err) {
      throw err
    }
  },

  renderTemplate: async (templateName: string, data: Record<string, any>): Promise<string> => {
    const filePath = path.join(__dirname, '../templates/email_templates', `${templateName}.mjml`)
    const mjmlSource = await readFile(filePath, 'utf-8')

    const compiled = handlebars.compile(mjmlSource)
    const mjmlWithData = compiled(data)

    const { html, errors } = mjml2html(mjmlWithData)

    if (errors.length > 0) {
      throw new Error(`MJML compilation failed: ${JSON.stringify(errors)}`)
    }

    return html
  }
}
