"use client";
// redesign.sh:v1

import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Button from "@/components/ui/Button";
import ConfettiLayer from "@/components/ui/ConfettiLayer";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import Screen from "@/components/ui/Screen";
import { site } from "@/content/site";
import { useConfetti } from "@/hooks/useConfetti";
import { TINTS } from "@/lib/tokens";
import { easeOutExpo, fade, pop, spring, stackLoose, viewportOnce } from "@/lib/motion";

/* The mood is a postage stamp. Its id is what /api/contact expects. */
const MOODS = [
    { id: "idea", emoji: "💡", label: "I have an idea", short: "Idea", tint: TINTS.amber },
    { id: "job", emoji: "💼", label: "I have a job", short: "Job", tint: TINTS.sky },
    { id: "team", emoji: "🤝", label: "Let's team up", short: "Team", tint: TINTS.green },
    { id: "hi", emoji: "👋", label: "Just saying hi", short: "Hello", tint: TINTS.rose },
] as const;

type Mood = (typeof MOODS)[number];
type Status = "idle" | "sending" | "sent" | "error";

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const MAX_MESSAGE = 1200;
const ERR = "text-[oklch(0.62_0.2_25)]";

const line =
    "w-full border-0 border-b border-foreground/30 bg-transparent py-1.5 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground aria-[invalid=true]:border-[oklch(0.62_0.2_25)]";

function Stamp({ mood, className = "" }: { mood: Mood; className?: string }) {
    return (
        <span
            style={{ "--tint": mood.tint } as CSSProperties}
            className={`relative inline-flex flex-col items-center justify-center gap-0.5 border border-dashed border-[color:var(--tint)] bg-[color-mix(in_oklab,var(--tint)_14%,var(--ed-paper))] p-1.5 ${className}`}
        >
            <span aria-hidden className="text-2xl leading-none">
                {mood.emoji}
            </span>
            <span className="text-xs font-semibold leading-none text-[color:var(--tint)]">{mood.short}</span>
        </span>
    );
}

function Postmark({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 100 100" aria-hidden className={className} fill="none" stroke="currentColor">
            <defs>
                <path id="ed-postmark-arc" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
            </defs>
            <circle cx="50" cy="50" r="46" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="30" strokeWidth="1" />
            <text fontSize="8.5" letterSpacing="2.2" fill="currentColor" stroke="none" fontFamily="ui-monospace, monospace">
                <textPath href="#ed-postmark-arc">DELHI NCR · REPLIES IN A DAY · </textPath>
            </text>
            <path d="M24 44 q7 -5 13 0 t13 0 t13 0 M24 54 q7 -5 13 0 t13 0 t13 0" strokeWidth="1" />
        </svg>
    );
}

function CopyEmail() {
    const [copied, setCopied] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(site.email);
        } catch {
            /* clipboard blocked, the mailto link still works */
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    }

    return (
        <Button onClick={copy} variant="outline">
            <span aria-live="polite" className="w-47">{copied ? "Copied" : site.email}</span>
        </Button>
    );
}

export default function Contact() {
    const reduce = !!useReducedMotion();
    const cardRef = useRef<HTMLDivElement>(null);
    const { bursts, fire } = useConfetti(!reduce);

    const [moodId, setMoodId] = useState<Mood["id"]>("idea");
    const [name, setName] = useState("");
    const [from, setFrom] = useState("");
    const [message, setMessage] = useState("");
    const [trap, setTrap] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [showErrors, setShowErrors] = useState(false);

    const mood = MOODS.find((m) => m.id === moodId) ?? MOODS[0];

    const errors = {
        name: name.trim().length < 2 ? "What should I call you?" : "",
        email: EMAIL_RE.test(from.trim()) ? "" : "That email looks a bit off",
        message: message.trim().length < 10 ? "A few more words, please" : "",
    };
    const valid = !errors.name && !errors.email && !errors.message;
    const shown = (key: keyof typeof errors) => (showErrors ? errors[key] : "");

    const mailto = () => {
        const subject = encodeURIComponent(`${mood.emoji} ${mood.label}`);
        const body = encodeURIComponent(`${message}\n\n${name} (${from})`);
        return `mailto:${site.email}?subject=${subject}&body=${body}`;
    };

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setShowErrors(true);
        if (!valid || status === "sending") return;
        setStatus("sending");
        const rect = cardRef.current?.getBoundingClientRect();
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mood: mood.id,
                    name: name.trim(),
                    email: from.trim(),
                    message: message.trim(),
                    website: trap,
                }),
            });
            if (!res.ok) throw new Error(String(res.status));
            setStatus("sent");
            if (rect) fire(rect.left + rect.width / 2, rect.top + rect.height / 2, 36);
        } catch {
            setStatus("error");
        }
    }

    function reset() {
        setName("");
        setFrom("");
        setMessage("");
        setTrap("");
        setShowErrors(false);
        setStatus("idle");
    }

    return (
        <Screen id="contact">
            <div className="mx-auto grid w-full max-w-6xl flex-1 content-center gap-12 px-4 pb-12 pt-[clamp(4.5rem,11vh,6.5rem)] sm:px-6 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16">
                {/* ---------- left: the words ---------- */}
                <motion.div
                    initial={reduce ? "show" : "hidden"}
                    whileInView="show"
                    viewport={viewportOnce}
                    variants={stackLoose}
                    className="flex flex-col items-start gap-[clamp(0.75rem,2.6vh,1.5rem)]"
                >
                    <motion.div variants={fade}>
                        <Eyebrow index="">Contact Me</Eyebrow>
                    </motion.div>

                    <Headline reduce={reduce} size="xl" toptext="Got an idea?" bottomtext="Say hi." />

                    <motion.p variants={fade} className="max-w-md text-base leading-7 text-muted-foreground">
                        Pick a stamp, write a few lines and post it. I read every message myself and usually reply within a day.
                    </motion.p>

                    <motion.div variants={fade}>
                        <CopyEmail />
                    </motion.div>

                    <motion.ul variants={fade} className="flex flex-wrap gap-x-6 gap-y-2">
                        {site.social.map((l) => (
                            <li key={l.label}>
                                <a
                                    href={l.href}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="ed-link rounded-sm text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                    {l.label} <span aria-hidden>↗</span>
                                </a>
                            </li>
                        ))}
                    </motion.ul>
                </motion.div>

                {/* ---------- right: the letter ---------- */}
                <motion.div
                    initial={reduce ? false : { opacity: 0, y: 36, rotate: 1.2 }}
                    whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ ...spring, delay: 0.08 }}
                    className="w-full"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {status === "sent" ? (
                            <motion.div
                                key="sent"
                                initial={reduce ? false : { opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="ed-paper flex min-h-[22rem] flex-col items-center justify-center gap-4 px-8 py-10 text-center"
                            >
                                <svg viewBox="0 0 120 120" aria-hidden className="size-28 -rotate-6 text-primary">
                                    <motion.circle
                                        cx="60"
                                        cy="60"
                                        r="52"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        initial={reduce ? false : { pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 1, ease: easeOutExpo }}
                                    />
                                    <text x="60" y="64" textAnchor="middle" fontSize="11" letterSpacing="3" fill="currentColor" fontFamily="ui-monospace, monospace">
                                        DELIVERED
                                    </text>
                                </svg>
                                <h3 className="text-2xl font-semibold tracking-tight">
                                    Thanks, <span className="ds-serif text-primary">{name.trim().split(" ")[0]}.</span>
                                </h3>
                                <p className="max-w-xs text-sm leading-6 text-muted-foreground">Your letter is on its way. I&apos;ll write back soon.</p>
                                <Button onClick={reset} variant="outline" size="sm">
                                    Write another letter
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                noValidate
                                onSubmit={onSubmit}
                                exit={
                                    reduce
                                        ? { opacity: 0 }
                                        : { opacity: 0, x: 240, y: -140, rotate: 10, scale: 0.5, transition: { duration: 0.55, ease: "easeIn" } }
                                }
                                className="relative"
                            >
                                <motion.div
                                    ref={cardRef}
                                    animate={status === "sending" && !reduce ? { y: [0, -3, 0], transition: { duration: 0.9, repeat: Infinity } } : { y: 0 }}
                                    className="ed-paper pb-8 pl-14 pr-6 pt-8 sm:pl-[4.25rem] sm:pr-10 sm:pt-10"
                                >
                                    {/* stamp + postmark, top right */}
                                    <div className="absolute right-4 top-4 h-[4.6rem] w-[3.8rem] sm:right-6 sm:top-6">
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            <motion.div
                                                key={mood.id}
                                                initial={reduce ? false : { y: -60, scale: 1.6, rotate: -20, opacity: 0 }}
                                                animate={{ y: 0, scale: 1, rotate: 4, opacity: 1 }}
                                                exit={{ opacity: 0, y: 16, transition: { duration: 0.12 } }}
                                                transition={pop}
                                                className="h-full w-full"
                                            >
                                                <Stamp mood={mood} className="h-full w-full" />
                                            </motion.div>
                                        </AnimatePresence>
                                        <Postmark className="pointer-events-none absolute -left-12 top-1 size-20 -rotate-12 text-foreground/30" />
                                    </div>

                                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{site.location}</p>

                                    <div className="mt-6 flex items-baseline justify-between gap-4 pr-20 sm:pr-24">
                                        <label htmlFor="c-msg" className="ds-serif text-3xl italic">
                                            Dear Raunak,
                                        </label>
                                    </div>

                                    <textarea
                                        id="c-msg"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Tell me a little about it..."
                                        maxLength={MAX_MESSAGE}
                                        aria-invalid={!!shown("message")}
                                        aria-describedby={shown("message") ? "c-msg-error" : undefined}
                                        className="ed-ruled mt-3 block h-[12rem] w-full resize-none bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/60"
                                    />
                                    <div className="mt-1 flex items-start justify-between gap-3">
                                        <div className="min-h-4">
                                            {shown("message") && (
                                                <p id="c-msg-error" role="alert" className={`text-xs ${ERR}`}>
                                                    {shown("message")}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-xs tabular-nums text-muted-foreground">
                                            {message.length}/{MAX_MESSAGE}
                                        </span>
                                    </div>

                                    <p className="ds-serif mt-5 text-xl italic">Yours,</p>
                                    <div className="mt-2 grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="c-name" className="text-xs font-medium text-muted-foreground">
                                                From
                                            </label>
                                            <input
                                                id="c-name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Ada Lovelace"
                                                autoComplete="name"
                                                maxLength={100}
                                                aria-invalid={!!shown("name")}
                                                aria-describedby={shown("name") ? "c-name-error" : undefined}
                                                className={line}
                                            />
                                            {shown("name") && (
                                                <p id="c-name-error" role="alert" className={`mt-1 text-xs ${ERR}`}>
                                                    {shown("name")}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="c-email" className="text-xs font-medium text-muted-foreground">
                                                Reply to
                                            </label>
                                            <input
                                                id="c-email"
                                                type="email"
                                                value={from}
                                                onChange={(e) => setFrom(e.target.value)}
                                                placeholder="ada@example.com"
                                                autoComplete="email"
                                                maxLength={200}
                                                aria-invalid={!!shown("email")}
                                                aria-describedby={shown("email") ? "c-email-error" : undefined}
                                                className={line}
                                            />
                                            {shown("email") && (
                                                <p id="c-email-error" role="alert" className={`mt-1 text-xs ${ERR}`}>
                                                    {shown("email")}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Honeypot. People never see or fill this. */}
                                    <input
                                        type="text"
                                        name="website"
                                        value={trap}
                                        onChange={(e) => setTrap(e.target.value)}
                                        tabIndex={-1}
                                        autoComplete="off"
                                        aria-hidden
                                        className="absolute -left-[9999px] size-0 opacity-0"
                                    />
                                </motion.div>

                                {/* stamp tray + send */}
                                <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                                    <fieldset className="min-w-0">
                                        <legend className="mb-2 text-sm font-medium">Pick a stamp</legend>
                                        <div className="flex flex-wrap gap-2.5">
                                            {MOODS.map((m, i) => {
                                                const on = m.id === moodId;
                                                return (
                                                    <motion.button
                                                        key={m.id}
                                                        type="button"
                                                        aria-pressed={on}
                                                        aria-label={m.label}
                                                        title={m.label}
                                                        onClick={() => setMoodId(m.id)}
                                                        whileHover={reduce ? undefined : { y: -3, rotate: i % 2 ? 3 : -3 }}
                                                        whileTap={reduce ? undefined : { scale: 0.94 }}
                                                        animate={reduce ? undefined : { y: on ? -5 : 0 }}
                                                        transition={pop}
                                                        className={`rounded-sm outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                                            on ? "drop-shadow-md" : "opacity-70 hover:opacity-100"
                                                        }`}
                                                    >
                                                        <Stamp mood={m} className="h-14 w-12" />
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </fieldset>

                                    <Button type="submit" variant="solid" loading={status === "sending"}>
                                        {status === "sending" ? "Posting..." : "Post it"}
                                    </Button>
                                </div>

                                {status === "error" && (
                                    <p role="alert" className="mt-4 text-sm text-muted-foreground">
                                        That didn&apos;t go through, so the letter is still here.{" "}
                                        <a href={mailto()} className="font-medium text-primary underline underline-offset-4">
                                            Send it from your email app instead
                                        </a>
                                        .
                                    </p>
                                )}
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <ConfettiLayer bursts={bursts} />
        </Screen>
    );
}
