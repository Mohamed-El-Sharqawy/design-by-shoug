import { sendEmail } from "@/lib/mail";

const OWNER_EMAIL = "ddesignbyshoug@gmail.com";

export abstract class ContactService {
  static async sendContactEmail(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    await sendEmail({
      to: OWNER_EMAIL,
      subject: `Contact Form: ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1A1A1A;">New Contact Message</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #999; width: 80px;">Name</td><td style="padding: 8px 0;">${data.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #999;">Email</td><td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #8B7355;">${data.email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #999;">Subject</td><td style="padding: 8px 0;">${data.subject}</td></tr>
          </table>
          <div style="margin-top: 16px; padding: 12px; background-color: #fafafa; border-radius: 4px;">
            <p style="white-space: pre-wrap; margin: 0; color: #333;">${data.message}</p>
          </div>
        </div>
      `,
      text: `Name: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}\n\n${data.message}`,
      bcc: OWNER_EMAIL !== "ddesignbyshoug@gmail.com" ? [OWNER_EMAIL] : undefined,
    });
  }
}
