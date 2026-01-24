import { useTheme } from "next-themes";
import Cloud from "./Clouds";
import Disks from "./Disks";
import HeroIntroCard from "./HeroCard";
import Stars from "./Stars";
import Navbar from "@/components/navbar/Navbar";

const HeroSection = () => {
    const { theme } = useTheme();
    // const mounted = useMounted();
    // if (!mounted) return null;
    return (
        <>
            <div className="h-screen w-full relative flex justify-center items-center  ">
                <div className="absolute inset-0 z-10 ">
                    <Disks />
                </div>
                {theme === "dark" && <Stars />}
            </div>
            <header>
                <Navbar />
            </header>

            <div className="absolute left-0 w-[98vw] h-screen z-20 top-100">
                <Cloud />
            </div>
            <div className="absolute z-20 flex bottom-[20vh] left-[0.5vw]">
                <HeroIntroCard />
            </div>
        </>
    );
};

export default HeroSection;
