"use client";

import Divider from "@/components/section/Divider";
import Disks from "@/components/section/heroSection/Disks";
import { useMounted } from "@/hooks/useMounted";
import { Divide } from "lucide-react";

export default function Test() {
    const mounted = useMounted();

    if (!mounted) return null;

    return (
        <div className="w-screen h-screen flex bg-background items-center justify-center">
            <Divider sectionName="About me"/>
        </div>
    );
};
