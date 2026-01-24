"use client";

import { useEffect, useState } from "react";

const HeroDisks = () => {
    const [ringCount, setRingCount] = useState(14);

    useEffect(() => {
        const update = () => {
            const size = window.innerWidth;

            if (size < 480)
                setRingCount(8); // small phones
            else if (size < 768)
                setRingCount(8); // tablets
            else if (size < 1200)
                setRingCount(12); // laptops
            else setRingCount(16); // large screens
        };

        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    return (
        <div className="relative w-full h-screen  flex items-center justify-center">
            <div className="relative aspect-square w-screen overflow-hidden">
                {Array.from({ length: ringCount }).map((_, i) => {
                    const scaleStep = 0.85 / ringCount;
                    const scale = 1 - i * scaleStep;

                    return (
                        <div
                            key={i}
                            className="absolute inset-0 rounded-full"
                            style={{
                                transform: `scale(${scale})`,
                                background: `var(--disc-${i + 1})`,
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default HeroDisks;
