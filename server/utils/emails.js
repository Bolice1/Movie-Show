const transporter = require('../config/mailer');

const sendWelcomeEmail = async (email, userName) => {
    const mailOptions = {
        from: `"Movie Show" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to Movie Show! 🎬',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #e50914; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">🎬 Movie Show</h1>
                </div>
                <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
                    <h2 style="color: #333;">Welcome, ${userName}! 👋</h2>
                    <p style="color: #555; font-size: 16px;">We're excited to have you on board. Your account has been created successfully.</p>
                    <p style="color: #555; font-size: 16px;">Here's what you can do on Movie Show:</p>
                    <ul style="color: #555; font-size: 16px;">
                        <li>🎥 Browse Movies & Series</li>
                        <li>📋 Add content to your Watchlist</li>
                        <li>❤️ Like your favourite content</li>
                        <li>⭐ Rate and review content</li>
                    </ul>
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                        If you didn't create this account, please ignore this email.
                    </p>
                </div>
            </div>
        `
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
};

const sendPasswordResetEmail = async (email, userName, resetToken) => {
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    const mailOptions = {
        from: `"Movie Show" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request 🔐',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #e50914; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">🎬 Movie Show</h1>
                </div>
                <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
                    <h2 style="color: #333;">Hi ${userName},</h2>
                    <p style="color: #555; font-size: 16px;">
                        We received a request to reset your password.
                        Click the button below to reset it.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}"
                           style="background-color: #e50914; color: white; padding: 14px 32px;
                                  text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #555; font-size: 14px;">
                        This link expires in <strong>1 hour</strong>.
                    </p>
                    <p style="color: #999; font-size: 12px;">
                        If you didn't request a password reset, ignore this email. Your password won't change.
                    </p>
                </div>
            </div>
        `
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };