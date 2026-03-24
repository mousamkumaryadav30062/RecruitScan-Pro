import nodemailer from 'nodemailer';

/* ===============================
   UTILITIES
================================ */
export const generateRandomPassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const generateMasterId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* ===============================
   CREATE TRANSPORTER (Factory)
================================ */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/* ===============================
   REGISTRATION EMAIL
================================ */
export const sendCredentials = async (toEmail, masterId, password) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: '🎉 Welcome to RecruitScan Pro!',
      html: `
        <div style="font-family: Segoe UI, sans-serif; background:#f7fafc; padding:20px;">
          <div style="max-width:600px; margin:auto; background:#ffffff; padding:25px; border-radius:10px;">
            <h2 style="color:#2b6cb0;">Welcome to RecruitScan Pro ✅</h2>

            <p>Your account has been successfully created.</p>

            <div style="background:#e6fffa; padding:15px; border-left:5px solid #38b2ac; margin:20px 0;">
              <p><strong>Master ID:</strong> ${masterId}</p>
              <p><strong>Password:</strong> ${password}</p>
            </div>

            <p>Please change your password after first login.</p>

            <p style="margin-top:25px; font-size:12px; color:#718096;">
              © ${new Date().getFullYear()} RecruitScan Pro
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Registration email sent to:', toEmail);
  } catch (error) {
    console.error('REGISTRATION EMAIL ERROR:', error);
    throw new Error('Failed to send registration email');
  }
};

/* ===============================
   PASSWORD RESET EMAIL
================================ */
export const sendPasswordReset = async (toEmail, name, masterId, password) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: '🔐 RecruitScan Pro – Password Reset',
      html: `
        <div style="font-family: Segoe UI, sans-serif; background:#f7fafc; padding:20px;">
          <div style="max-width:600px; margin:auto; background:#ffffff; padding:25px; border-radius:10px;">
            <h2 style="color:#e53e3e;">Password Reset</h2>

            <p>Hello <b>${name}</b>,</p>
            <p>Your password has been reset successfully.</p>

            <div style="background:#edf2f7; padding:15px; border-left:5px solid #e53e3e; margin:20px 0;">
              <p><strong>Master ID:</strong> ${masterId}</p>
              <p><strong>New Password:</strong> ${password}</p>
            </div>

            <p>Please login and change your password immediately.</p>

            <p style="margin-top:25px; font-size:12px; color:#718096;">
              © ${new Date().getFullYear()} RecruitScan Pro
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', toEmail);
  } catch (error) {
    console.error('RESET EMAIL ERROR:', error);
    throw new Error('Failed to send password reset email');
  }
};

/* ===============================
   APPLICATION APPROVAL EMAIL
================================ */
export const sendApplicationApprovedEmail = async ({
  toEmail,
  name,
  masterId,
  vacancyName
}) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: '✅ Application Approved - RecruitScan Pro',
      html: `
        <div style="font-family: Segoe UI, sans-serif; background:#f7fafc; padding:20px;">
          <div style="max-width:600px; margin:auto; background:#ffffff; padding:25px; border-radius:10px;">
            <h2 style="color:#16a34a;">Application Approved ✅</h2>

            <p>Hello <b>${name}</b>,</p>
            <p>Your application has been approved successfully.</p>

            <div style="background:#f0fdf4; padding:15px; border-left:5px solid #16a34a; margin:20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Master ID:</strong> ${masterId}</p>
              <p><strong>Company / Vacancy:</strong> ${vacancyName}</p>
              <p><strong>Status:</strong> Approved</p>
            </div>

            <p>Please keep checking your dashboard for further updates.</p>

            <p style="margin-top:25px; font-size:12px; color:#718096;">
              © ${new Date().getFullYear()} RecruitScan Pro
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Application approval email sent to:', toEmail);
  } catch (error) {
    console.error('APPLICATION APPROVAL EMAIL ERROR:', error);
    throw new Error('Failed to send application approval email');
  }
};

/* ===============================
   APPLICATION REJECTION EMAIL
================================ */
export const sendApplicationRejectedEmail = async ({
  toEmail,
  name,
  masterId,
  vacancyName,
  rejectionReason
}) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: '❌ Application Rejected - RecruitScan Pro',
      html: `
        <div style="font-family: Segoe UI, sans-serif; background:#f7fafc; padding:20px;">
          <div style="max-width:600px; margin:auto; background:#ffffff; padding:25px; border-radius:10px;">
            <h2 style="color:#dc2626;">Application Rejected ❌</h2>

            <p>Hello <b>${name}</b>,</p>
            <p>We regret to inform you that your application has been rejected.</p>

            <div style="background:#fef2f2; padding:15px; border-left:5px solid #dc2626; margin:20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Master ID:</strong> ${masterId}</p>
              <p><strong>Company / Vacancy:</strong> ${vacancyName}</p>
              <p><strong>Status:</strong> Rejected</p>
            </div>

            <div style="background:#fff7ed; padding:15px; border-left:5px solid #f97316; margin:20px 0;">
              <p><strong>Message from Admin:</strong></p>
              <p>${rejectionReason || 'No reason provided.'}</p>
            </div>

            <p>Please check your dashboard for more details.</p>

            <p style="margin-top:25px; font-size:12px; color:#718096;">
              © ${new Date().getFullYear()} RecruitScan Pro
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Application rejection email sent to:', toEmail);
  } catch (error) {
    console.error('APPLICATION REJECTION EMAIL ERROR:', error);
    throw new Error('Failed to send application rejection email');
  }
};