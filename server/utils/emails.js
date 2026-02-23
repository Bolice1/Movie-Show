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
                    <p style="color: #555; font-size: 16px;">
                        We're excited to have you on board. Your account has been created successfully.
                    </p>
                    <p style="color: #555; font-size: 16px;">Here's what you can do on Movie Show:</p>
                    <ul style="color: #555; font-size: 16px;">
                        <li>🎥 Browse Movies & Series</li>
                        <li>📋 Add content to your Watchlist</li>
                        <li>❤️ Like your favourite content</li>
                        <li>⭐ Rate and review content</li>
                    </ul>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:3000" 
                           style="background-color: #e50914; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; font-size: 16px;">
                            Start Watching
                        </a>
                    </div>
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

module.exports = { sendWelcomeEmail };