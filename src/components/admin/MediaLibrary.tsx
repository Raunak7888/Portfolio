"use client";

import { useState, useRef, useCallback } from "react";

interface MediaFile {
    name: string;
    path: string;
    url: string;
    size: number;
    ext: string;
}

interface Props {
    initialFiles: MediaFile[];
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibrary({ initialFiles }: Props) {
    const [files, setFiles] = useState<MediaFile[]>(initialFiles);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);
    const [selected, setSelected] = useState<MediaFile | null>(null);
    const [renaming, setRenaming] = useState<string | null>(null);
    const [renameVal, setRenameVal] = useState("");
    const [filter, setFilter] = useState<string>("all");
    const [toast, setToast] = useState<{
        type: "ok" | "err";
        msg: string;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function showToast(type: "ok" | "err", msg: string) {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    }

    const uploadFiles = useCallback(async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;
        setUploading(true);
        const results: MediaFile[] = [];

        for (const file of Array.from(fileList)) {
            setUploadProgress(`Uploading ${file.name}…`);
            const fd = new FormData();
            fd.append("file", file);
            try {
                const res = await fetch("/api/admin/media/upload", {
                    method: "POST",
                    body: fd,
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error ?? "Upload failed");
                // Refresh list
                results.push({
                    name: json.name,
                    path: "",
                    url: json.url,
                    size: file.size,
                    ext: "." + file.name.split(".").pop()!.toLowerCase(),
                });
            } catch (err) {
                showToast(
                    "err",
                    err instanceof Error ? err.message : "Upload failed",
                );
            }
        }

        if (results.length > 0) {
            setFiles((f) => [...results, ...f]);
            showToast("ok", `Uploaded ${results.length} file(s)`);
        }
        setUploading(false);
        setUploadProgress(null);
    }, []);
    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragging(false);
            uploadFiles(e.dataTransfer.files);
        },
        [uploadFiles],
    );

    async function handleDelete(file: MediaFile) {
        if (!confirm(`Delete "${file.name}"?`)) return;
        try {
            const res = await fetch("/api/admin/media", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: file.url }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Delete failed");
            setFiles((f) => f.filter((x) => x.url !== file.url));
            if (selected?.url === file.url) setSelected(null);
            showToast("ok", `Deleted "${file.name}"`);
        } catch (err) {
            showToast(
                "err",
                err instanceof Error ? err.message : "Delete failed",
            );
        }
    }

    async function handleRename(file: MediaFile) {
        const newName = renameVal.trim();
        if (!newName) return;
        try {
            const res = await fetch("/api/admin/media", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: file.url, newName }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error ?? "Rename failed");
            setFiles((f) =>
                f.map((x) =>
                    x.url === file.url
                        ? { ...x, name: newName, url: json.url }
                        : x,
                ),
            );
            setRenaming(null);
            setRenameVal("");
            showToast("ok", "Renamed successfully");
        } catch (err) {
            showToast(
                "err",
                err instanceof Error ? err.message : "Rename failed",
            );
        }
    }

    const EXT_FILTERS = [
        "all",
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
        ".svg",
        ".gif",
    ];
    const filtered =
        filter === "all" ? files : files.filter((f) => f.ext === filter);

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-white">
                        Media Library
                    </h1>
                    <p className="text-sm text-white/40 mt-1">
                        {files.length} file(s) in{" "}
                        <code className="text-indigo-400 text-xs">/public</code>
                    </p>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-medium text-white transition-colors"
                >
                    {uploading ? (uploadProgress ?? "Uploading…") : "↑ Upload"}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.webp,.svg,.gif"
                    className="hidden"
                    onChange={(e) => uploadFiles(e.target.files)}
                />
            </div>

            {toast && (
                <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                        toast.type === "ok"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            : "bg-red-500/10 border-red-500/30 text-red-300"
                    }`}
                >
                    {toast.msg}
                </div>
            )}

            {/* Drop zone */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`rounded-2xl border-2 border-dashed transition-all p-8 text-center cursor-pointer ${
                    dragging
                        ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300"
                        : "border-white/8 text-white/30 hover:border-white/[0.14] hover:text-white/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
            >
                <p className="text-3xl mb-2">⊞</p>
                <p className="text-sm">
                    Drag & drop images here, or click to select
                </p>
                <p className="text-xs mt-1 opacity-60">
                    PNG, JPG, JPEG, WEBP, SVG · Max 10 MB
                </p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap items-center">
                {EXT_FILTERS.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                            filter === f
                                ? "bg-indigo-600/30 border border-indigo-500/40 text-indigo-300"
                                : "border border-white/6 text-white/40 hover:text-white/70"
                        }`}
                    >
                        {f === "all" ? "All" : f.toUpperCase()}
                    </button>
                ))}
                <span className="ml-auto text-xs text-white/30">
                    {filtered.length} file(s)
                </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {filtered.map((file) => (
                    <div
                        key={file.url}
                        onClick={() => setSelected(file)}
                        className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all ${
                            selected?.url === file.url
                                ? "border-indigo-500/60 ring-1 ring-indigo-500/30"
                                : "border-white/6 hover:border-white/12"
                        }`}
                    >
                        {/* Thumbnail */}
                        <div className="aspect-square bg-white/3 flex items-center justify-center overflow-hidden">
                            {file.ext === ".svg" ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-full h-full object-contain p-1"
                                />
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        {/* Name */}
                        <div className="px-2 py-1.5 bg-[#0a0a0a]">
                            <p className="text-xs text-white/50 truncate">
                                {file.name}
                            </p>
                            <p className="text-[10px] text-white/20">
                                {formatBytes(file.size)}
                            </p>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="col-span-full text-center py-12 text-white/30">
                        <p className="text-3xl mb-2">⊞</p>
                        <p className="text-sm">No images found.</p>
                    </div>
                )}
            </div>

            {/* Selected file detail panel */}
            {selected && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 w-full max-w-md space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-white truncate flex-1 mr-3">
                                {selected.name}
                            </h3>
                            <button
                                onClick={() => setSelected(null)}
                                className="text-white/30 hover:text-white/60 transition-colors shrink-0"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Preview */}
                        <div className="aspect-video rounded-xl bg-white/3 border border-white/6 overflow-hidden flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={selected.url}
                                alt={selected.name}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>

                        {/* Info */}
                        <div className="space-y-1.5 text-xs text-white/40">
                            <div className="flex justify-between">
                                <span>Size</span>
                                <span className="text-white/60">
                                    {formatBytes(selected.size)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Type</span>
                                <span className="text-white/60">
                                    {selected.ext.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>URL</span>
                                <span className="text-indigo-400 font-mono truncate ml-4 max-w-[60%] text-right">
                                    {selected.url}
                                </span>
                            </div>
                        </div>

                        {/* Copy URL */}
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(selected.url);
                                showToast("ok", "URL copied to clipboard");
                            }}
                            className="w-full py-2 rounded-xl border border-white/8 text-xs text-white/50 hover:text-white/80 transition-all"
                        >
                            Copy URL
                        </button>

                        {/* Rename */}
                        {renaming === selected.url ? (
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    value={renameVal}
                                    onChange={(e) =>
                                        setRenameVal(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                            handleRename(selected);
                                        if (e.key === "Escape") {
                                            setRenaming(null);
                                            setRenameVal("");
                                        }
                                    }}
                                    className="flex-1 bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                                    placeholder="new-filename.png"
                                />
                                <button
                                    onClick={() => handleRename(selected)}
                                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setRenaming(null);
                                        setRenameVal("");
                                    }}
                                    className="px-3 py-2 rounded-xl border border-white/8 text-xs text-white/50 transition-all"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setRenaming(selected.url);
                                    setRenameVal(selected.name);
                                }}
                                className="w-full py-2 rounded-xl border border-white/8 text-xs text-white/50 hover:text-white/80 transition-all"
                            >
                                Rename
                            </button>
                        )}

                        {/* Delete */}
                        <button
                            onClick={() => {
                                handleDelete(selected);
                                setSelected(null);
                            }}
                            className="w-full py-2 rounded-xl border border-red-500/20 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            Delete File
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
