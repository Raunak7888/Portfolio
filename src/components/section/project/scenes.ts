import type { ComponentType } from "react";
import type { SceneId } from "@/content/projects";
import { FoilScene, LoupeScene, type SceneProps } from "./ProjectScenes";
import { CipherScene } from "./CipherScene";
import { ForgeScene } from "./ForgeScene";

/** Scene registry. One entry per project; add a scene here to use it. */
export const SCENES: Record<SceneId, ComponentType<SceneProps>> = {
    cipher: CipherScene,
    foil: FoilScene,
    loupe: LoupeScene,
    forge: ForgeScene,
};
