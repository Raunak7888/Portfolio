"use client";

import { useState } from "react";
import { Frame, Shot, ratioOf, type InteractionProps } from "./parts";

/*
 * "filmstrip": a light sweep crosses the frame and a strip of thumbnails
 * rises from the bottom. Hover or focus a thumbnail to swap the screenshot.
 */
export default function Filmstrip({ project, shots }: InteractionProps) {
    const [i, setI] = useState(0);

    return (
        <div className="pm-film">
            <Frame ratio={ratioOf(shots[0])}>
                {shots.map((s, k) => (
                    <Shot
                        key={s.src}
                        shot={s}
                        eager={k === 0}
                        decorative={k !== i}
                        className={`absolute inset-0 size-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${
                            k === i ? "opacity-100" : "opacity-0"
                        }`}
                    />
                ))}
                <span aria-hidden className="pm-sheen" />

                {shots.length > 1 && (
                    <ul className="pm-strip" aria-label={`${project.name} screenshots`}>
                        {shots.map((s, k) => (
                            <li key={s.src} className="shrink-0">
                                <button
                                    type="button"
                                    className="pm-thumb"
                                    aria-pressed={k === i}
                                    aria-label={`Show screenshot ${k + 1} of ${shots.length}`}
                                    onClick={() => setI(k)}
                                    onFocus={() => setI(k)}
                                    onPointerEnter={(e) => e.pointerType === "mouse" && setI(k)}
                                >
                                    <Shot shot={s} decorative />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </Frame>
        </div>
    );
}
