import nodemailer from 'nodemailer';

export const testEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Create transporter using .env
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Send test mail
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Test Email - Exam Roll System',
      html: `
        <h3>Email Test Successful ✅</h3>
        <p>Your email configuration is working correctly.</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully'
    });

  } catch (error) {
    console.error('Email Test Error:', error);
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message
    });
  }
};
