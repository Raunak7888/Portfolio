// lib/gsap.ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {TextPlugin} from "gsap/TextPlugin"
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

let registered = false;

if (typeof window !== "undefined" && !registered) {
    gsap.registerPlugin(ScrollTrigger, TextPlugin,ScrambleTextPlugin);
    registered = true;
}

export { gsap, ScrollTrigger };
