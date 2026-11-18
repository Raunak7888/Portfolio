import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { NextResponse } from "next/server";
import data from "@/Data/Data.json";

export const runtime = "nodejs";

const MOODS: Record<string, string> = {
    idea: "💡 Idea",
    job: "💼 Job",
    team: "🤝 Collab",
    hi: "👋 Hello",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_BODY_BYTES = 20_000;

/**
 * In-memory limiter. It is per server instance. On serverless platforms each
 * instance keeps its own counter, so treat this as a speed bump, not a wall.
 * A shared store (for example Redis) is needed for a hard limit.
 */
const hits = new Map<string, number[]>();

let cached: Transporter | null = null;
function getMailer() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    if (!user || !pass) return null;
    cached ??= nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
    return { transporter: cached, user };
}

function escapeHtml(value: string) {
    const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return value.replace(/[&<>"']/g, (c) => map[c]);
}

function clientIp(req: Request) {
    return (
        req.headers.get("x-real-ip") ??
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown"
    );
}

function limited(ip: string) {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    if (recent.length >= LIMIT) {
        hits.set(ip, recent);
        return true;
    }
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 500) {
        for (const [key, list] of hits) {
            if (list.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
        }
    }
    return false;
}

export async function POST(req: Request) {
    try {
        if (limited(clientIp(req))) {
            return NextResponse.json(
                { error: "Too many messages. Try again later." },
                { status: 429, headers: { "Retry-After": String(Math.ceil(WINDOW_MS / 1000)) } },
            );
        }

        if (!(req.headers.get("content-type") ?? "").includes("application/json")) {
            return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
        }
        if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
            return NextResponse.json({ error: "Request too large" }, { status: 413 });
        }
        const raw = await req.text().catch(() => "");
        if (raw.length > MAX_BODY_BYTES) {
            return NextResponse.json({ error: "Request too large" }, { status: 413 });
        }
        let parsed: unknown;
        try {
            parsed = JSON.parse(raw);
        } catch {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }
        const body = parsed as Record<string, unknown>;

        // Honeypot: real people never fill this field. Pretend it worked.
        if (typeof body.website === "string" && body.website.trim() !== "") {
            return NextResponse.json({ success: true }, { status: 200 });
        }

        const name = typeof body.name === "string" ? body.name.replace(/[\r\n]+/g, " ").trim() : "";
        const email = typeof body.email === "string" ? body.email.trim() : "";
        const message = typeof body.message === "string" ? body.message.trim() : "";
        const mood = typeof body.mood === "string" ? (MOODS[body.mood] ?? MOODS.hi) : MOODS.hi;

        if (!name || !email || !message) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }
        if (name.length > 100 || email.length > 200 || message.length > 5000) {
            return NextResponse.json({ error: "Message is too long" }, { status: 400 });
        }
        if (!EMAIL_RE.test(email)) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }

        const mailer = getMailer();
        if (!mailer) {
            console.error("Contact form: EMAIL_USER / EMAIL_PASS are not set.");
            return NextResponse.json({ error: "Contact form is not configured" }, { status: 503 });
        }

        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeMessage = escapeHtml(message);

        const html = `
        <div style="font-family: sans-serif; background-color: #f4f7f9; padding: 40px 10px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                <div style="background: #a826ff; padding: 40px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">New Inquiry · ${escapeHtml(mood)}</h1>
                </div>
                <div style="padding: 40px; color: #1a1a1a; line-height: 1.6;">
                    <div style="margin-bottom: 25px;">
                        <div style="font-size: 12px; font-weight: 700; color: #a826ff; text-transform: uppercase; margin-bottom: 5px;">Sender</div>
                        <div style="font-size: 18px; font-weight: 500;">${safeName}</div>
                    </div>
                    <div style="margin-bottom: 25px;">
                        <div style="font-size: 12px; font-weight: 700; color: #a826ff; text-transform: uppercase; margin-bottom: 5px;">Reply To</div>
                        <div style="font-size: 16px;">${safeEmail}</div>
                    </div>
                    <div style="padding: 20px; background: #f8f0ff; border-radius: 12px;">
                        <div style="font-size: 12px; font-weight: 700; color: #a826ff; text-transform: uppercase; margin-bottom: 8px;">Message</div>
                        <div style="font-size: 15px; color: #444; white-space: pre-wrap;">${safeMessage}</div>
                    </div>
                </div>
                <div style="background: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    Received via Portfolio Contact Form • ${new Date().toISOString()}
                </div>
            </div>
        </div>`;

        await mailer.transporter.sendMail({
            from: `"Portfolio Notifications" <${mailer.user}>`,
            to: data.hero.email,
            replyTo: email,
            subject: `✨ ${mood} from ${name}`,
            text: `New message from ${name} (${email}) [${mood}]:\n\n${message}`,
            html,
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Mail Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
