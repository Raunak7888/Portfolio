"use client";

import React from "react";
import { GridBackground } from "@/components/GridBackground";
import ProjectDetail from "@/components/section/project/details/ProjectPage";

export default function Page({
    params,
}: {
    params: Promise<{ projectId: string }>;
}) {
    const { projectId } = React.use(params);

    return (
        <GridBackground>
            <ProjectDetail projectId={projectId} />
        </GridBackground>
    );
}
