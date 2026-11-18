import About from "@/components/section/about/about";
import Contact from "@/components/section/contact/contact";
import Experience from "@/components/section/experience/Experience";
import Footer from "@/components/section/footer/Footer";
import Hero from "@/components/section/hero/Hero";
import Projects from "@/components/section/project/Projects";
import Skills from "@/components/section/skill/Skills";
import Marquee from "@/components/ui/Marquee";
import { site } from "@/content/site";

/**
 * Server component. The page-wide cursor spotlight was removed: it duplicated
 * the About spotlight and the Hero night sky. Each section keeps one
 * distinctive effect instead.
 */
export default function Page() {
    return (
        <div className="relative min-h-screen w-full bg-background selection:bg-primary selection:text-primary-foreground">
            <Hero />
            <Marquee items={site.stack} />
            <About />
            <Skills />
            <Projects />
            <Experience />
            <Contact />
            <Footer />
        </div>
    );
}
