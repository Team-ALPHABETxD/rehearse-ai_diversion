import { Injectable } from '@nestjs/common';
import nodemailer from "nodemailer"
import path from "path"
import ejs from "ejs"

@Injectable()
export class EmailService {
    porter = nodemailer.createTransport({
        host: process.env.SMTP_PORT,
        port: Number(process.env.SMTP_PORT) || 587,
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })

    // EJS template
    async renderEmailTemplate (tempName: string, data: Record<string, any>): Promise<string> {
        const tempPath = path.join(
            process.cwd(),
            "src",
            "modules",
            "email",
            "templates",
            `${tempName}.ejs`
        )

        return ejs.renderFile(tempPath, data)
    }

    // Email sending
    async sendEmail (to:string, subject:string, tempName:string, data:Record<string, any>) {
        try {
            const html = await this.renderEmailTemplate(tempName, data)

            await this.porter.sendMail({
                from: `<${process.env.SMTP_USER}`,
                to,
                subject,
                html
            })

            return true
        } catch (error) {
            console.log(`Error sending mail: ${error}`)
            return false
        }
    }
    
}
