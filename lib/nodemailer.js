import nodemailer from "nodemailer"

// Create a transporter using Ethereal test credentials.

const testAccount=await nodemailer.createTestAccount();
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: "alfred25@ethereal.email",
    pass: "SnDc9PycWNv19UaXGg",
  },
});

// Send an email using async/await
export const sendEmail=async({to,subject,html})=>{
    const info=await transporter.sendMail({
        from:`'URL SHORTENER'<${testAccount.user}>`,
        to,
        subject,
        html
    });

    const testEmailURL=nodemailer.getTestMessageUrl(info)
    console.log("verify Email",testEmailURL)
}