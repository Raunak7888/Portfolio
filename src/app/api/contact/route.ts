import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    try {
        console.info(`[${requestId}] Contact request received`);

        const { name, email, message } = await req.json();

        console.debug(`[${requestId}] Payload parsed`, {
            namePresent: !!name,
            emailPresent: !!email,
            messageLength: message?.length,
        });

        if (!name || !email || !message) {
            console.warn(`[${requestId}] Validation failed`);

            return NextResponse.json(
                { error: "Missing fields" },
                { status: 400 },
            );
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        console.info(`[${requestId}] Sending email`);

        // 1. Create the HTML Template
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                .header { background: linear-gradient(135deg, #a826ff 0%, #8c20d4 100%); padding: 30px; text-align: center; color: white; }
                .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
                .content { padding: 30px; background-color: #ffffff; }
                .field { margin-bottom: 20px; }
                .label { font-weight: bold; color: #8c20d4; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; display: block; margin-bottom: 5px; }
                .value { font-size: 16px; color: #2e2e2e; background: #f9f5ff; padding: 12px; border-radius: 8px; border-left: 4px solid #a826ff; }
                .message-box { white-space: pre-wrap; line-height: 1.8; }
                .footer { background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Portfolio Message</h1>
                </div>
                <div class="content">
                    <div class="field">
                        <span class="label">From</span>
                        <div class="value">${name}</div>
                    </div>
                    <div class="field">
                        <span class="label">Email Address</span>
                        <div class="value">${email}</div>
                    </div>
                    <div class="field">
                        <span class="label">Message</span>
                        <div class="value message-box">${message}</div>
                    </div>
                </div>
                <div class="footer">
                    Sent via your Portfolio Contact Form • ${new Date().toLocaleString()}
                </div>
            </div>
        </body>
        </html>
        `;

        // 2. Send the Email
        await transporter.sendMail({
            from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `🚀 New message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`, // Fallback for plain-text clients
            html: htmlContent, // The cool looking version
        });

        console.info(`[${requestId}] Email sent successfully`, {
            durationMs: Date.now() - startTime,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(`[${requestId}] Email send failed`, {
            durationMs: Date.now() - startTime,
            error: err instanceof Error ? err.message : err,
        });

        return NextResponse.json(
            { error: "Failed to send email" },
            { status: 500 },
        );
    }
}
