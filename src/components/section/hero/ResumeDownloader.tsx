import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function ResumeButton() {
    const [loading, setLoading] = useState(false);

    return (
        <a
            href="/Raunak_yadav_resume.pdf"
            download="Raunak_Yadav_Resume.pdf"
            onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1200);
            }}
            className={`h-12 px-8 bg-primary text-primary-foreground
                font-semibold rounded-full flex items-center gap-2
                transition-transform hover:scale-[1.05]
                ${loading ? "pointer-events-none opacity-80" : ""}`}
        >
            {loading ? (
                <>
                    <Loader2 size={16} className="animate-spin" />
                    Downloading
                </>
            ) : (
                <>
                    Resume
                    <Download size={14} />
                </>
            )}
        </a>
    );
}
