"use client";

import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ConfettiLayer from "@/components/ui/ConfettiLayer";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import Screen from "@/components/ui/Screen";
import { site } from "@/content/site";
import { chunky } from "@/lib/ds";
import { useConfetti } from "@/hooks/useConfetti";
import { TINTS } from "@/lib/tokens";
import { fade, pop, spring, stackLoose, viewportOnce } from "@/lib/motion";

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
const CARD_H = "h-auto sm:h-[clamp(18rem,50vh,26rem)]";
const ERR = "text-[oklch(0.62_0.2_25)]";


const underline =
    "w-full border-0 border-b-2 border-dashed border-foreground/35 bg-transparent py-1.5 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground aria-[invalid=true]:border-[oklch(0.62_0.2_25)]";

function Stamp({ mood, className = "" }: { mood: Mood; className?: string }) {
    return (
        <span
            style={{ "--tint": mood.tint } as CSSProperties}
            className={`relative inline-flex flex-col items-center justify-center gap-0.5 border-2 border-dashed border-[color:var(--tint)] bg-[color-mix(in_oklab,var(--tint)_18%,var(--background))] p-1.5 ${className}`}
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
                <path id="rd-postmark-arc" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
            </defs>
            <circle cx="50" cy="50" r="46" strokeWidth="2" />
            <circle cx="50" cy="50" r="30" strokeWidth="1.5" />
            <text fontSize="8.5" letterSpacing="2.2" fill="currentColor" stroke="none" fontFamily="ui-monospace, monospace">
                <textPath href="#rd-postmark-arc">DELHI NCR · REPLIES IN A DAY · </textPath>
            </text>
            <path d="M24 44 q7 -5 13 0 t13 0 t13 0 M24 54 q7 -5 13 0 t13 0 t13 0" strokeWidth="1.5" />
        </svg>
    );
}

function CopyEmail({ reduce }: { reduce: boolean }) {
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
        <motion.button
            type="button"
            onClick={copy}
            whileTap={reduce ? undefined : { scale: 0.95 }}
            transition={spring}
            className={`inline-flex h-12 items-center gap-3 rounded-full bg-background px-5 text-sm font-semibold ${chunky}`}
        >
            <span aria-hidden>{copied ? "✅" : "📋"}</span>
            <span aria-live="polite">{copied ? "Copied!" : site.email}</span>
        </motion.button>
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
        <Screen id="contact" className="ds-dots">
            <div className="mx-auto grid w-full max-w-6xl flex-1 content-center gap-8 px-4 pb-8 pt-[clamp(4.5rem,11vh,6.5rem)] sm:px-6 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-14">
                {/* ---------- left: the words ---------- */}
                <motion.div
                    initial={reduce ? "show" : "hidden"}
                    whileInView="show"
                    viewport={viewportOnce}
                    variants={stackLoose}
                    className="flex flex-col items-start gap-[clamp(0.75rem,2.6vh,1.5rem)]"
                >
                    <motion.div variants={fade}>
                        <Eyebrow index="05">Contact</Eyebrow>
                    </motion.div>

                    <Headline reduce={reduce} size="xl" toptext="Got an idea?" bottomtext="Say hi." />

                    <motion.p variants={fade} className="max-w-md text-base leading-7 text-muted-foreground">
                        Pick a stamp, write a few lines and post it. I read every message myself and usually reply
                        within a day.
                    </motion.p>

                    <motion.div variants={fade}>
                        <CopyEmail reduce={reduce} />
                    </motion.div>

                    <motion.ul variants={fade} className="flex flex-wrap gap-2">
                        {site.social.map((l) => (
                            <li key={l.label}>
                                <a
                                    href={l.href}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className={`rd-wiggle inline-flex h-9 items-center gap-1 rounded-full bg-background px-4 text-sm font-semibold ${chunky}`}
                                >
                                    {l.label} <span aria-hidden>↗</span>
                                </a>
                            </li>
                        ))}
                    </motion.ul>
                </motion.div>

                {/* ---------- right: the postcard ---------- */}
                <motion.div
                    initial={reduce ? false : { opacity: 0, y: 36, rotate: 2 }}
                    whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ ...spring, delay: 0.08 }}
                    className="w-full"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {status === "sent" ? (
                            <motion.div
                                key="sent"
                                initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className={`flex min-h-[18rem] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-foreground/40 p-6 text-center ${CARD_H}`}
                            >
                                <motion.div
                                    initial={reduce ? false : { scale: 3, rotate: -26, opacity: 0 }}
                                    animate={{ scale: 1, rotate: -8, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 380, damping: 14 }}
                                    className="rounded-xl border-4 border-double border-primary px-6 py-3 text-2xl font-bold tracking-[0.25em] text-primary"
                                >
                                    DELIVERED
                                </motion.div>
                                <h3 className="text-2xl font-semibold tracking-tight">
                                    Thanks, <span className="ds-serif text-primary">{name.trim().split(" ")[0]}.</span>
                                </h3>
                                <p className="max-w-xs text-sm leading-6 text-muted-foreground">
                                    Your card is on its way. I&apos;ll write back soon.
                                </p>
                                <button
                                    type="button"
                                    onClick={reset}
                                    className={`h-11 rounded-full bg-background px-5 text-sm font-semibold ${chunky}`}
                                >
                                    Write another card
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                noValidate
                                onSubmit={onSubmit}
                                exit={
                                    reduce
                                        ? { opacity: 0 }
                                        : {
                                              opacity: 0,
                                              x: 280,
                                              y: -150,
                                              rotate: 14,
                                              scale: 0.45,
                                              transition: { duration: 0.55, ease: "easeIn" },
                                          }
                                }
                                className="relative flex flex-col gap-5"
                            >
                                {/* the card */}
                                <motion.div
                                    ref={cardRef}
                                    animate={
                                        status === "sending" && !reduce
                                            ? { rotate: [0, -1.2, 1.2, -0.6, 0], transition: { duration: 0.5, repeat: Infinity } }
                                            : { rotate: 0 }
                                    }
                                    className={`relative grid rounded-2xl border-2 border-foreground bg-[color-mix(in_oklab,var(--background)_90%,var(--primary))] shadow-[8px_8px_0_0_var(--foreground)] sm:grid-cols-[1.15fr_1fr] ${CARD_H}`}
                                >
                                    {/* message side */}
                                    <div className="flex min-h-[11rem] min-w-0 flex-col gap-1 p-4 sm:p-5">
                                        <div className="flex items-baseline justify-between">
                                            <label htmlFor="c-msg" className="ds-serif text-xl italic">
                                                Dear Raunak,
                                            </label>
                                            <span className="text-xs tabular-nums text-muted-foreground">
                                                {message.length}/{MAX_MESSAGE}
                                            </span>
                                        </div>
                                        <textarea
                                            id="c-msg"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Tell me a little about it..."
                                            maxLength={MAX_MESSAGE}
                                            aria-invalid={!!shown("message")}
                                            aria-describedby={shown("message") ? "c-msg-error" : undefined}
                                            className="rd-paper-lines min-h-0 flex-1 resize-none bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/60"
                                        />
                                        {shown("message") && (
                                            <p id="c-msg-error" role="alert" className={`text-xs ${ERR}`}>
                                                {shown("message")}
                                            </p>
                                        )}
                                    </div>

                                    {/* address side */}
                                    <div className="relative flex min-w-0 flex-col justify-end gap-3 border-t-2 border-dashed border-foreground/35 p-4 pt-24 sm:border-l-2 sm:border-t-0 sm:p-5 sm:pt-24">
                                        <div className="absolute right-3 top-3 h-[5.2rem] w-[4.2rem]">
                                            <AnimatePresence mode="popLayout" initial={false}>
                                                <motion.div
                                                    key={mood.id}
                                                    initial={reduce ? false : { y: -70, scale: 1.8, rotate: -25, opacity: 0 }}
                                                    animate={{ y: 0, scale: 1, rotate: 4, opacity: 1 }}
                                                    exit={{ opacity: 0, y: 20, transition: { duration: 0.12 } }}
                                                    transition={{ type: "spring", stiffness: 420, damping: 18 }}
                                                    className="h-full w-full"
                                                >
                                                    <Stamp mood={mood} className="h-full w-full" />
                                                </motion.div>
                                            </AnimatePresence>
                                            <Postmark className="pointer-events-none absolute -left-12 top-1 size-20 -rotate-12 text-foreground/35" />
                                        </div>

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
                                                className={underline}
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
                                                className={underline}
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
                                <div className="flex flex-wrap items-end justify-between gap-4">
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
                                                        whileHover={reduce ? undefined : { y: -4, rotate: i % 2 ? 4 : -4 }}
                                                        whileTap={reduce ? undefined : { scale: 0.9 }}
                                                        animate={reduce ? undefined : { y: on ? -6 : 0, rotate: on ? 0 : [-2, 2, -1, 1][i] }}
                                                        transition={pop}
                                                        className={`rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                                            on ? "drop-shadow-[3px_3px_0_var(--foreground)]" : "opacity-80 hover:opacity-100"
                                                        }`}
                                                    >
                                                        <Stamp mood={m} className="h-14 w-12" />
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </fieldset>

                                    <motion.button
                                        type="submit"
                                        disabled={status === "sending"}
                                        whileTap={reduce ? undefined : { scale: 0.96 }}
                                        transition={spring}
                                        className={`group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:cursor-wait disabled:opacity-70 ${chunky}`}
                                    >
                                        {status === "sending" ? "Posting..." : "Post it"}
                                        <span
                                            aria-hidden
                                            className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-1"
                                        >
                                            🚀
                                        </span>
                                    </motion.button>
                                </div>

                                {status === "error" && (
                                    <p role="alert" className="text-sm text-muted-foreground">
                                        That didn&apos;t go through, so the card is still here.{" "}
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
