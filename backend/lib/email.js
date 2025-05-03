import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER || "anyhirelk@gmail.com",
        pass: process.env.EMAIL_APP_PASSWORD || "luqt cxrj gxnv fusr",
    },
});

export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || "anyhirelk@gmail.com",
            to,
            subject,
            html,
            text: text || undefined,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};