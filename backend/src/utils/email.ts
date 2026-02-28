import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || ''
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

// Template for new contact notification
export const sendContactNotification = async (name: string, phone: string, email?: string): Promise<boolean> => {
  const subject = 'Новая заявка на вступление в AURVA';
  const emailField = email ? `<p><strong>Email:</strong> ${email}</p>` : '';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563EB;">Новая заявка на членство</h2>
      <p>Получена новая заявка на вступление в ассоциацию AURVA:</p>
      <div style="background-color: #F4F6F8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Название компании / Имя:</strong> ${name}</p>
        <p><strong>Контактный телефон:</strong> ${phone}</p>
        ${emailField}
        <p><strong>Дата подачи:</strong> ${new Date().toLocaleString('ru-RU')}</p>
      </div>
      <p style="color: #64748B; font-size: 12px;">
        Это автоматическое уведомление с сайта AURVA.
      </p>
    </div>
  `;

  return sendEmail({
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '',
    subject,
    html,
    text: `Новая заявка от ${name}, телефон: ${phone}${email ? `, email: ${email}` : ''}`
  });
};

// Template for contact confirmation (optional)
export const sendContactConfirmation = async (email: string, name: string): Promise<boolean> => {
  const subject = 'Ваша заявка получена - AURVA';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563EB;">Спасибо за интерес к AURVA!</h2>
      <p>Здравствуйте, ${name}!</p>
      <p>Мы получили вашу заявку на вступление в Ассоциацию Участников Рынка Виртуальных Активов.</p>
      <p>Наши специалисты свяжутся с вами в ближайшее время для обсуждения условий членства.</p>
      <div style="margin: 30px 0; padding: 20px; background-color: #EFF6FF; border-left: 4px solid #2563EB; border-radius: 4px;">
        <p style="margin: 0;"><strong>Контакты AURVA:</strong></p>
        <p style="margin: 5px 0;">Email: aurva.kg@gmail.com</p>
        <p style="margin: 5px 0;">Телефон: +996 550 99 90 10</p>
      </div>
      <p style="color: #64748B; font-size: 12px;">
        С уважением,<br>
        Команда AURVA
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    text: `Здравствуйте, ${name}! Мы получили вашу заявку на вступление в AURVA.`
  });
};
