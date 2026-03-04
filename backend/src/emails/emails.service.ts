import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImapFlow } from 'imapflow';
import { simpleParser, ParsedMail } from 'mailparser'; // 👈 استيراد نوع ParsedMail

@Injectable()
export class EmailsService {
  constructor(private config: ConfigService) {}

  async getLatestEmails(limit: number = 15) {
    const client = new ImapFlow({
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

    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');
      const emails = [];

      try {
        // حماية 1: التأكد من وجود صندوق البريد بطريقة يقبلها TypeScript
        if (!client.mailbox) {
          return [];
        }

        const totalMessages = client.mailbox.exists;
        if (totalMessages === 0) return [];

        const start = Math.max(1, totalMessages - limit + 1);
        const sequence = `${start}:${totalMessages}`;

        for await (const message of client.fetch(sequence, { source: true, envelope: true, flags: true })) {
          // حماية 2: تجاهل الرسالة إذا لم يكن لها مصدر (محتوى)
          if (!message.source) {
            continue;
          }

          // حماية 3: إجبار TypeScript على التعامل مع النتيجة كـ ParsedMail صريح
          const parsed: ParsedMail = await simpleParser(message.source as Buffer);
          
          emails.push({
            id: message.uid,
            subject: parsed.subject || 'بدون عنوان',
            from: parsed.from?.text || 'مجهول',
            date: parsed.date,
            text: parsed.text,
            html: parsed.html,
            isUnread: !message.flags?.has('\\Seen'),
          });
        }
      } finally {
        lock.release();
      }

      await client.logout();
      return emails.reverse();

    } catch (error) {
      console.error('IMAP Error:', error);
      throw new InternalServerErrorException('فشل الاتصال بسيرفر البريد وقراءة الرسائل');
    }
  }
}