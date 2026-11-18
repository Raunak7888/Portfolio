"use client";

import { useEffect, useRef, useState } from "react";
import { Frame, Shot, ratioOf, type InteractionProps } from "./parts";

/*
 * "conversation": a live message thread. Hover (or tap) and chat bubbles
 * slide in while the screenshots advance like a running conversation.
 */
export default function Conversation({ project, shots, reduce }: InteractionProps) {
    const [on, setOn] = useState(false);
    const [i, setI] = useState(0);
    const touch = useRef(false);

    useEffect(() => {
        if (!on || reduce || shots.length < 2) return;
        const t = window.setInterval(() => setI((v) => (v + 1) % shots.length), 1800);
        return () => window.clearInterval(t);
    }, [on, reduce, shots.length]);

    const close = () => {
        setOn(false);
        setI(0);
    };

    return (
        <button
            type="button"
            data-on={on}
            aria-pressed={on}
            aria-label={`${project.name} screenshots. Toggle the live preview`}
            onPointerDown={(e) => {
                touch.current = e.pointerType !== "mouse";
            }}
            onPointerEnter={(e) => e.pointerType === "mouse" && setOn(true)}
            onPointerLeave={(e) => e.pointerType === "mouse" && close()}
            onBlur={close}
            onClick={(e) => {
                if (touch.current || e.detail === 0) (on ? close : () => setOn(true))();
            }}
            className="group block w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
            <Frame ratio={ratioOf(shots[0])}>
                {shots.map((s, k) => (
                    <Shot
                        key={s.src}
                        shot={s}
                        eager={k === 0}
                        decorative={k !== 0}
                        className={`absolute inset-0 size-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${
                            k === i ? "opacity-100" : "opacity-0"
                        }`}
                    />
                ))}

                <span aria-hidden className="pm-thread">
                    <span className="pm-bubble pm-in">
                        <i className="pm-dot" />
                        <i className="pm-dot" />
                        <i className="pm-dot" />
                    </span>
                    <span className="pm-bubble pm-out">
                        <i className="pm-line" style={{ width: "6rem" }} />
                        <i className="pm-line" style={{ width: "3.5rem" }} />
                    </span>
                    <span className="pm-bubble pm-in">
                        <i className="pm-line" style={{ width: "5rem" }} />
                    </span>
                </span>

                {shots.length > 1 && (
                    <span aria-hidden className="pm-pips">
                        {shots.map((s, k) => (
                            <i key={s.src} className="pm-pip" data-current={k === i} />
                        ))}
                    </span>
                )}
                <span className="pm-chip">{on ? "live preview" : (project.readout ?? "hover or tap to preview")}</span>
            </Frame>
        </button>
    );
}
