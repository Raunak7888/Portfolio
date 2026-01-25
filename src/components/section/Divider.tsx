interface DividerProps {
    sectionName: string;
    className?: string;
}

const Divider = ({ sectionName, className }: DividerProps) => {
    return (
        <div
            className={`relative w-full flex items-center justify-center pt-20 pb-16 ${className}`}
        >
            {/* Horizontal rails */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center">
                <div className="h-0.5 grow bg-linear-to-r from-transparent via-primary/40 to-primary/70" />
                <div className="w-32 md:w-48" />
                <div className="h-0.5 grow bg-linear-to-l from-transparent via-primary/40 to-primary/70" />
            </div>

            {/* Title */}
            <div className="relative z-10 flex items-center gap-4 px-4 bottom-2 bg-background">
                <span className="font-mono text-xl text-primary/30 select-none">
                    {"{"}
                </span>

                <h2 className="text-2xl md:text-3xl font-mono font-semibold uppercase tracking-[0.35em] text-primary">
                    {"<"}
                    {sectionName}
                    {"/>"}
                </h2>

                <span className="font-mono text-xl text-primary/30 select-none">
                    {"}"}
                </span>
            </div>
        </div>
    );
};

export default Divider;
