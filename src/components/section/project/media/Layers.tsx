import { Frame, Shot, ratioOf, type InteractionProps } from "./parts";

/*
 * "layers": the main screenshot sits on top of two sheets that fan out on
 * hover. Extra screenshots appear on the sheets. Works with a single image.
 */
export default function Layers({ project, shots }: InteractionProps) {
    const back = [shots[1], shots[2]];

    return (
        <div className="pm-stack">
            <div className="pm-stack-inner">
                {back.map((s, k) => (
                    <span key={k} aria-hidden className={`pm-layer-back ${k === 0 ? "pm-layer-1" : "pm-layer-2"}`}>
                        {s && <Shot shot={s} decorative />}
                    </span>
                ))}
                <div className="pm-layer-0">
                    <Frame ratio={ratioOf(shots[0])}>
                        <Shot shot={shots[0]} eager className="absolute inset-0 size-full object-cover" />
                        <span className="pm-chip">
                            {shots.length > 1 ? `${shots.length} screenshots` : (project.readout ?? "work in progress")}
                        </span>
                    </Frame>
                </div>
            </div>
        </div>
    );
}
