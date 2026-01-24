import React from "react";

interface StarProps {
    size: number; // in vw
    xPos: number; // in vw
    yPos: number; // in vh
    color?: string;
}

interface StarSvgProps {
    color?: string;
    filled?: boolean;
    strokeWidth?: number;
    className?: string;
}

export const StarSvg = ({
    color = "var(--foreground)",
    filled = false,
    strokeWidth = 1,
    className = "",
}: StarSvgProps) => (
    <svg
        className={` ${className}`}
        viewBox="0 0 24 24"
        fill={filled ? color : "none"}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M12 3L14.0357 8.16153C14.2236 8.63799 14.3175 8.87622 14.4614 9.0771C14.5889 9.25516 14.7448 9.41106 14.9229 9.53859C15.1238 9.68245 15.362 9.77641 15.8385 9.96432L21 12L15.8385 14.0357C15.362 14.2236 15.1238 14.3175 14.9229 14.4614C14.7448 14.5889 14.5889 14.7448 14.4614 14.9229C14.3175 15.1238 14.2236 15.362 14.0357 15.8385L12 21L9.96432 15.8385C9.77641 15.362 9.68245 15.1238 9.53859 14.9229C9.41106 14.7448 9.25516 14.5889 9.0771 14.4614C8.87622 14.3175 8.63799 14.2236 8.16153 14.0357L3 12L8.16153 9.96432C8.63799 9.77641 8.87622 9.68245 9.0771 9.53859C9.25516 9.41106 9.41106 9.25516 9.53859 9.0771C9.68245 8.87622 9.77641 8.63799 9.96432 8.16153L12 3Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="square"
            strokeLinejoin="miter"
        />
    </svg>
);

const Star: React.FC<StarProps> = ({
    size,
    xPos,
    yPos,
    color = "var(--foreground)",
}) => {
    return (
        <div
            className="absolute z-15"
            style={{
                left: `${xPos}vw`,
                top: `${yPos}vh`,
                width: `${size}vw`,
                height: `${size}vw`,
            }}
        >
            <svg
                className="w-full h-full"
                viewBox="0 0 24 24"
                fill={color}
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 3L14.0357 8.16153C14.2236 8.63799 14.3175 8.87622 14.4614 9.0771C14.5889 9.25516 14.7448 9.41106 14.9229 9.53859C15.1238 9.68245 15.362 9.77641 15.8385 9.96432L21 12L15.8385 14.0357C15.362 14.2236 15.1238 14.3175 14.9229 14.4614C14.7448 14.5889 14.5889 14.7448 14.4614 14.9229C14.3175 15.1238 14.2236 15.362 14.0357 15.8385L12 21L9.96432 15.8385C9.77641 15.362 9.68245 15.1238 9.53859 14.9229C9.41106 14.7448 9.25516 14.5889 9.0771 14.4614C8.87622 14.3175 8.63799 14.2236 8.16153 14.0357L3 12L8.16153 9.96432C8.63799 9.77641 8.87622 9.68245 9.0771 9.53859C9.25516 9.41106 9.41106 9.25516 9.53859 9.0771C9.68245 8.87622 9.77641 8.63799 9.96432 8.16153L12 3Z"
                    stroke={color}
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
};

const Stars = () => {
    return (
        <div className="absolute w-screen h-screen pointer-events-none z-15 ">
            <Star size={6} xPos={1} yPos={1} />
            <Star size={3} xPos={38.5} yPos={52} />
            <Star size={2.5} xPos={35} yPos={14} />
            <Star size={3.5} xPos={78} yPos={8} />
            <Star size={3} xPos={85} yPos={45} />
            <Star size={2.3} xPos={53} yPos={0} />
            <Star size={2.1} xPos={55} yPos={33} />
        </div>
    );
};

export default Stars;
