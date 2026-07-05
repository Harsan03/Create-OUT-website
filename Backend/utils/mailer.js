const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const sendConfirmationEmail = async (name, email) => {
  await transporter.sendMail({
    from: `"Create OUT" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'We received your enquiry — Create OUT',
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="font-size: 22px; margin-bottom: 8px;">Hi ${name},</h2>
        <p style="font-size: 15px; line-height: 1.6;">
          Thanks for reaching out to <strong>Create OUT</strong>. We've received your enquiry and will get back to you within <strong>1–2 business days</strong>.
        </p>
        <p style="font-size: 15px; line-height: 1.6;">
          In the meantime, feel free to reply to this email if you have any questions.
        </p>
        <br/>
        <p style="font-size: 14px; color: #555;">— The Create OUT Team</p>
      </div>
    `
  });
};

const sendAdminNotification = async (name, email, business, budget, message) => {
  await transporter.sendMail({
    from: `"Create OUT" <${process.env.GMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New enquiry from ${name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="font-size: 20px; margin-bottom: 16px;">New Enquiry Received</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name</td>
            <td style="padding: 8px 0;">${name}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px 0; font-weight: bold;">Email</td>
            <td style="padding: 8px 0;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Business</td>
            <td style="padding: 8px 0;">${business}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px 0; font-weight: bold;">Budget</td>
            <td style="padding: 8px 0;">${budget}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Message</td>
            <td style="padding: 8px 0;">${message}</td>
          </tr>
        </table>
      </div>
    `
  });
};

module.exports = { sendConfirmationEmail, sendAdminNotification };