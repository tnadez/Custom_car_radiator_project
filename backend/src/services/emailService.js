
const nodemailer = require('nodemailer');
const { render } = require('@react-email/components');
const PaymentConfirmation = require('../emails/PaymentConfirmation');
const PaymentFailed = require('../emails/PaymentFailed');
require('dotenv').config();
// Send payment failed email
exports.sendPaymentFailed = async (orderDetails, retryUrl) => {
    try {
        const { customerEmail, customerName } = orderDetails;
        if (!customerEmail) {
            console.log('No customer email provided, skipping email send');
            return { success: false, message: 'No email provided' };
        }
        const emailHtml = await render(PaymentFailed({ orderDetails, retryUrl }));
        const info = await transporter.sendMail({
            from: `"Custom Radiator Shop" <${process.env.SMTP_USER}>`,
            to: customerEmail,
            subject: `❌ การชำระเงินไม่สำเร็จ - คำสั่งซื้อ #${orderDetails.orderId}`,
            html: emailHtml,
        });
        console.log('Payment failed email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending payment failed email:', error);
        return { success: false, error: error.message };
    }
};

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Send payment confirmation email
exports.sendPaymentConfirmation = async (orderDetails) => {
    try {
        const { customerEmail, customerName } = orderDetails;

        if (!customerEmail) {
            console.log('No customer email provided, skipping email send');
            return { success: false, message: 'No email provided' };
        }

        // Render React email to HTML
        const emailHtml = await render(PaymentConfirmation({ orderDetails }));

        // Send email
        const info = await transporter.sendMail({
            from: `"Custom Radiator Shop" <${process.env.SMTP_USER}>`,
            to: customerEmail,
            subject: `✅ การชำระเงินสำเร็จ - คำสั่งซื้อ #${orderDetails.orderId}`,
            html: emailHtml,
        });

        console.log('Payment confirmation email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending payment confirmation email:', error);
        return { success: false, error: error.message };
    }
};

// Verify email configuration
exports.verifyEmailConfig = async () => {
    try {
        await transporter.verify();
        console.log('Email server is ready to send messages');
        return true;
    } catch (error) {
        console.error('Email server verification failed:', error);
        return false;
    }
};
