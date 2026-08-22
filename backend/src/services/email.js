import nodemailer from "nodemailer";
import config from "../config/config.js";

let authConfig = {};

if (config.EMAIL_PASS) {
    authConfig = {
        user: config.GOOGLE_USER,
        pass: config.EMAIL_PASS
    };
} else {
    authConfig = {
        type: "OAuth2",
        user: config.GOOGLE_USER,
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        refreshToken: config.GOOGLE_REFRESH_TOKEN
    };
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: authConfig
});

transporter.verify((error, success) => {
    if (error) {
        console.log('Error connecting to email server:', error);
    } else {
        console.log("Server is ready to send our messages");
    }
})


const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"XYZ Service" <${config.GOOGLE_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export default sendEmail;
