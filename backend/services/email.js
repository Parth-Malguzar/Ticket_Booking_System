import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.APP_PASS,
            },
        });
    }
    return transporter;
};

export const sendEmail = async ({ to, subject, text, html, attachments }) => {
    const tx = getTransporter();
    return await tx.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
        attachments,
    });
};

export const sendTicketEmail = async (email, pdfBuffer) => {
    await sendEmail({
        to: email,
        subject: "Your Ticket",
        text: "Your booking was successful. Your ticket is attached as a PDF.",
        attachments: [
            {
                filename: "Ticket.pdf",
                content: pdfBuffer,
                contentType: "application/pdf",
            },
        ],
    });
};