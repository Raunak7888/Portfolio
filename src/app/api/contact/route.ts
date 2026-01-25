import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

// Initialize transporter once, outside the handler for better performance
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json();

        // 1. Precise Validation
        if (!name?.trim() || !email?.trim() || !message?.trim()) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }

        // 2. Modernized HTML Template
        const htmlContent = `
        <div style="font-family: sans-serif; background-color: #f4f7f9; padding: 40px 10px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                <div style="background: #a826ff; padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">New Inquiry Received</h1>
                </div>
                <div style="padding: 40px; color: #1a1a1a; line-height: 1.6;">
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; font-size: 12px; font-weight: 700; color: #a826ff; text-transform: uppercase; margin-bottom: 5px;">Sender</label>
                        <div style="font-size: 18px; font-weight: 500;">${name}</div>
                    </div>
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; font-size: 12px; font-weight: 700; color: #a826ff; text-transform: uppercase; margin-bottom: 5px;">Reply To</label>
                        <div style="font-size: 16px;">${email}</div>
                    </div>
                    <div style="margin-bottom: 25px; padding: 20px; background: #f8f0ff; border-radius: 12px;">
                        <label style="display: block; font-size: 12px; font-weight: 700; color: #a826ff; text-transform: uppercase; margin-bottom: 8px;">Message Content</label>
                        <div style="font-size: 15px; color: #444; white-space: pre-wrap;">${message}</div>
                    </div>
                </div>
                <div style="background: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    Received via Portfolio Contact Form • ${new Date().toLocaleString()}
                </div>
            </div>
        </div>`;

        // 3. Send via Nodemailer
        await transporter.sendMail({
            from: `"Portfolio Notifications" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `✨ New message from ${name}`,
            text: `New message from ${name} (${email}): ${message}`,
            html: htmlContent,
        });

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Mail Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}