const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter on startup
transporter.verify((error) => {
    if (error) {
        console.error(' Mailer connection failed:', error.message);
    } else {
        console.log('Mailer ready');
    }
});

module.exports = transporter;