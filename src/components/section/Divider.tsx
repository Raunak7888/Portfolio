interface DividerProps {
    sectionName: string;
    className?: string;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
}

const Divider = ({ sectionName, className, x1=240, y1=60, x2=410, y2=60 }: DividerProps) => {
    return (
        <svg
            viewBox="0 35 1000 40"
            className={`w-full text-foreground pt-5 `}
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Left line */}
            <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="2"
            />

            {/* Right line */}
            <line
                x1={x1+350}
                y1={y1}
                x2={x2+350}
                y2={y2}
                stroke="currentColor"
                strokeWidth="2"
            />

            {/* Left droplet */}
            <g transform="translate(231 53) rotate(90) ">
                <path
                    d="M0 0c0-2 1-3.9 3-5.5s3.5-4 4-6.5c.5 2.5 2 4.9 4 6.5C13 -3.9 14-2 14 0a7 7 0 1 1-14 0z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                />
            </g>

            {/* Right droplet */}
            <g transform="translate(769 67) rotate(270)">
                <path
                    d="M0 0c0-2 1-3.9 3-5.5s3.5-4 4-6.5c.5 2.5 2 4.9 4 6.5C13-3.9 14-2 14 0a7 7 0 1 1-14 0z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                />
            </g>

            {/* Center label background */}

            {/* Section name */}
            <text
                x="500"
                y="61"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-bold text-xl font-mitr fill-current"
            >
                {sectionName}
            </text>

            {/* Top star (aligned relative to divider) */}
            <path
                d={`M${x2+11} 49 l3 8 8 3-8 3-3 8-3-8-8-3 8-3z`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />

            {/* Bottom star (mirrored) */}
            <path
                d={`M${x2+168} 71 l3-8 8-3-8-3-3-8-3 8-8 3 8 3z`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
        </svg>
    );
};

export default Divider;
