"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  RefreshIcon,
  SecurityLockIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface BrowserFrameProps {
  images: string[];
  activeImageIndex: number;
  onPrev: () => void;
  onNext: () => void;
  previewUrl?: string;
  projectTitle: string;
}

export function BrowserFrame({
  images,
  activeImageIndex,
  onPrev,
  onNext,
  previewUrl,
  projectTitle,
}: BrowserFrameProps) {
  const canPrev = activeImageIndex > 0;
  const canNext = activeImageIndex < images.length - 1;
  const displayUrl = previewUrl ?? `localhost:3000/${projectTitle.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="w-auto rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl shadow-black/60">
      {/* Chrome bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800 bg-neutral-950">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onPrev}
            disabled={!canPrev}
            className="p-1 rounded-lg text-neutral-600 hover:text-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous screenshot"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          </button>
          <button
            onClick={onNext}
            disabled={!canNext}
            className="p-1 rounded-lg text-neutral-600 hover:text-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next screenshot"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </button>
        </div>

        {/* Address bar */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 min-w-0">
          <HugeiconsIcon icon={SecurityLockIcon} size={12} className="text-emerald-500 shrink-0" />
          <span className="text-[12px] text-neutral-500 font-mono truncate">
            {displayUrl}
          </span>
        </div>

        {/* Refresh icon */}
        <button className="p-1 rounded-lg text-neutral-700 hover:text-neutral-500 transition-colors shrink-0">
          <HugeiconsIcon icon={RefreshIcon} size={14} />
        </button>

        {/* Image counter */}
        {images.length > 1 && (
          <span className="text-[10px] text-neutral-700 font-mono shrink-0">
            {activeImageIndex + 1}/{images.length}
          </span>
        )}
      </div>

      {/* Screenshot area */}
      <div className="relative aspect-20/10 bg-neutral-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeImageIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeImageIndex]}
              alt={`${projectTitle} screenshot ${activeImageIndex + 1}`}
              fill
              className=""
              priority={activeImageIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Bottom vignette — very subtle depth */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-linear-to-t from-neutral-950/60 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}