// lib/gsap.ts
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

declare global {
    interface Window {
        __GSAP_REGISTERED__?: boolean;
    }
}

if (typeof window !== "undefined" && !window.__GSAP_REGISTERED__) {
    gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrambleTextPlugin);

    window.__GSAP_REGISTERED__ = true;
}

export { gsap, ScrollTrigger };
