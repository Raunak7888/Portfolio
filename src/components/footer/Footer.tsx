import { SocialIcons } from "../ui/SocialLinks";

const Footer = () => {
    return (
        <footer className="w-full border-t border-border bg-background">
            <div
                className="
                mx-auto max-w-7xl
                px-6 
                flex flex-col gap-4
                sm:flex-row sm:items-center sm:justify-between
            "
            >
                {/* Left content */}
                <div
                    className="
                font-mitr text-xs sm:text-sm
                text-muted-foreground
                flex flex-wrap items-center gap-1
                text-center sm:text-left
            "
                >
                    <span>© {new Date().getFullYear()}</span>

                    <span className="text-foreground font-semibold">
                        Raunak Yadav
                    </span>

                    <span className="hidden sm:inline text-border mx-1">—</span>

                    <span className="w-full sm:w-auto">
                        Everything’s open source. Take it, build better.
                    </span>
                </div>

                {/* Right content */}
                <div className="flex justify-center sm:justify-end">
                    <SocialIcons size={40} />
                </div>
            </div>
        </footer>
    );
};

export default Footer;
