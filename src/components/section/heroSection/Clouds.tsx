const Cloud = () => {
    return (
        <div className="flex justify-center items-center w-full h-full">
            <svg
                viewBox="0 0 800 400"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full"
            >
                {/* Back Layer (darker, more offset) */}
                <g className="fill-background ">
                    <g opacity="0.3" transform="translate(17, 40)">
                        <circle cx="30" cy="150" r="100" />
                        <circle cx="140" cy="150" r="100" />
                        <circle cx="260" cy="200" r="100" />
                        <circle cx="340" cy="165" r="100" />
                        <circle cx="340" cy="280" r="100" />
                        <circle cx="470" cy="110" r="100" />
                        <circle cx="480" cy="250" r="100" />
                        <circle cx="560" cy="200" r="100" />
                        <circle cx="640" cy="100" r="100" />
                        <circle cx="760" cy="100" r="100" />
                    </g>

                    {/* Middle Layer */}
                    <g opacity="0.3" transform="translate(15, 15)">
                        <circle cx="30" cy="150" r="100" />
                        <circle cx="140" cy="150" r="100" />
                        <circle cx="260" cy="200" r="100" />
                        <circle cx="340" cy="165" r="100" />
                        <circle cx="340" cy="280" r="100" />
                        <circle cx="470" cy="110" r="100" />
                        <circle cx="480" cy="250" r="100" />
                        <circle cx="560" cy="200" r="100" />
                        <circle cx="640" cy="100" r="100" />
                        <circle cx="760" cy="100" r="100" />
                    </g>

                    {/* Front Layer */}
                    <g opacity="1" transform="translate(17, 65)">
                        <circle cx="30" cy="150" r="100" />
                        <circle cx="140" cy="150" r="100" />
                        <circle cx="260" cy="200" r="100" />
                        <circle cx="340" cy="165" r="100" />
                        <circle cx="340" cy="280" r="100" />
                        <circle cx="470" cy="110" r="100" />
                        <circle cx="480" cy="250" r="100" />
                        <circle cx="560" cy="200" r="100" />
                        <circle cx="640" cy="100" r="100" />
                        <circle cx="760" cy="100" r="100" />
                    </g>
                </g>
            </svg>
        </div>
    );
};

export default Cloud;
