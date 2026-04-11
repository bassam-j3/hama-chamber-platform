import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImapFlow } from 'imapflow';
import * as nodemailer from 'nodemailer';
import { simpleParser, ParsedMail } from 'mailparser';
import { Express } from 'express';

@Injectable()
export class EmailsService {
  constructor(private config: ConfigService) {}

  private createImapClient(): ImapFlow {
    return new ImapFlow({
      host: this.config.get<string>('IMAP_HOST') || '',
      port: Number(this.config.get('IMAP_PORT')) || 993,
      secure: true,
      auth: {
        user: this.config.get<string>('SMTP_USER') || '',
        pass: this.config.get<string>('SMTP_PASS') || '',
      },
      tls: { rejectUnauthorized: false },
      logger: false,
    });
  }

  // 1. جلب قائمة الإيميلات من مجلد محدد (مصلح ليتوافق مع TypeScript)
  async getLatestEmails(folderType: string = 'INBOX', limit: number = 15) {
    const client = this.createImapClient();
    try {
      await client.connect();

      let targetPath = 'INBOX';
      const mailboxes = await client.list();

      if (folderType === 'SENT') {
        const sentFolder = mailboxes.find(
          (m) =>
            m.specialUse === '\\Sent' || m.path.toLowerCase().includes('sent'),
        );
        targetPath = sentFolder ? sentFolder.path : 'Sent';
      } else if (folderType === 'SPAM') {
        const spamFolder = mailboxes.find(
          (m) =>
            m.specialUse === '\\Junk' ||
            m.path.toLowerCase().includes('junk') ||
            m.path.toLowerCase().includes('spam'),
        );
        targetPath = spamFolder ? spamFolder.path : 'Junk';
      }

      const lock = await client.getMailboxLock(targetPath);
      const emails = [];

      try {
        // 👇 هنا الإصلاح: التحقق من وجود mailbox قبل الوصول لـ exists
        if (client.mailbox) {
          const totalMessages = client.mailbox.exists;
          if (totalMessages > 0) {
            const start = Math.max(1, totalMessages - limit + 1);
            for await (const message of client.fetch(
              `${start}:${totalMessages}`,
              { envelope: true, flags: true },
            )) {
              emails.push({
                id: message.uid,
                subject: message.envelope?.subject || 'بدون عنوان',
                from:
                  message.envelope?.from?.[0]?.address ||
                  message.envelope?.from?.[0]?.name ||
                  'مجهول',
                date: message.envelope?.date || new Date(),
                isUnread: !message.flags?.has('\\Seen'),
              });
            }
          }
        }
      } finally {
        lock.release();
      }
      await client.logout();
      return emails.reverse();
    } catch (error) {
      console.error(`IMAP Error for ${folderType}:`, error);
      return [];
    }
  }

  // 2. جلب تفاصيل إيميل واحد
  async getEmailDetails(uid: number) {
    const client = this.createImapClient();
    try {
      await client.connect();
      // تأكدنا من الدخول للـ INBOX لقراءة التفاصيل
      const lock = await client.getMailboxLock('INBOX');
      let emailDetails = null;

      try {
        const message = await client.fetchOne(
          uid.toString(),
          { source: true },
          { uid: true },
        );
        if (!message || !message.source)
          throw new NotFoundException('الرسالة غير موجودة');

        const parsed: ParsedMail = await simpleParser(message.source);
        emailDetails = {
          id: message.uid,
          subject: parsed.subject,
          from: parsed.from?.text,
          date: parsed.date,
          text: parsed.text,
          html: parsed.html || parsed.textAsHtml,
          attachments: parsed.attachments
            ? parsed.attachments.map((att) => ({
                filename: att.filename || 'مرفق',
                contentType: att.contentType,
                size: att.size,
                content: att.content ? att.content.toString('base64') : '',
              }))
            : [],
        };
      } finally {
        lock.release();
      }
      await client.logout();
      return emailDetails;
    } catch (error) {
      throw new InternalServerErrorException('فشل جلب تفاصيل الرسالة');
    }
  }

  // 3. تحديث حالة الرسالة
  async markEmailAsRead(uid: number) {
    const client = this.createImapClient();
    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');
      try {
        await client.messageFlagsAdd(uid.toString(), ['\\Seen'], { uid: true });
      } finally {
        lock.release();
      }
      await client.logout();
      return { success: true };
    } catch (error) {
      throw new InternalServerErrorException('فشل تحديث الحالة');
    }
  }

  // 4. حذف الرسالة (نقلها لسلة المهملات)
  async deleteEmail(uid: number) {
    const client = this.createImapClient();
    try {
      await client.connect();
      const mailboxes = await client.list();
      const trashFolder = mailboxes.find(
        (m) =>
          m.specialUse === '\\Trash' ||
          m.path.toLowerCase().includes('trash') ||
          m.path.toLowerCase().includes('deleted'),
      );

      const targetPath = trashFolder ? trashFolder.path : 'Trash';

      const lock = await client.getMailboxLock('INBOX');
      try {
        await client.messageMove(uid.toString(), targetPath, { uid: true });
      } finally {
        lock.release();
      }
      await client.logout();
      return { success: true };
    } catch (error) {
      console.error('IMAP Delete Error:', error);
      throw new InternalServerErrorException('فشل حذف الرسالة');
    }
  }

  // 5. إرسال بريد جديد
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    attachments?: Array<Express.Multer.File>,
  ) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      const mailOptions: any = {
        from: `"غرفة تجارة حماة" <${this.config.get('SMTP_USER')}>`,
        to,
        subject,
        html,
      };

      if (attachments) {
        mailOptions.attachments = attachments.map((file) => ({
          filename: file.originalname,
          content: file.buffer,
        }));
      }

      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      throw new InternalServerErrorException('فشل الإرسال');
    }
  }

  // 6. استقبال رسائل تواصل معنا من الموقع العام
  async sendContactMessage(name: string, email: string, subject: string, message: string) {
    const html = `
      <div dir="rtl" style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0056b3;">رسالة تواصل جديدة من الموقع العام</h2>
        <p><strong>الاسم:</strong> ${name}</p>
        <p><strong>البريد الإلكتروني:</strong> ${email}</p>
        <p><strong>الموضوع:</strong> ${subject}</p>
        <hr/>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `;
    const to = this.config.get<string>('SMTP_USER') || '';
    return await this.sendEmail(to, `[Contact Form] ${subject}`, html);
  }
}
