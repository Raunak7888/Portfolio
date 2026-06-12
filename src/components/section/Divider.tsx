interface DividerProps {
    sectionName: string;
    className?: string;
}

const Divider = ({ sectionName, className }: DividerProps) => {
    return (
        <div className={`px-6 sm:px-8 lg:px-16 py-10 ${className ?? ""}`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-5 h-px bg-primary" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary font-medium">
                        {sectionName}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Divider;