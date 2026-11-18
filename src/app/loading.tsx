export default function Loading() {
    return (
        <div role="status" aria-live="polite" className="fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden">
            <span className="ds-loading-bar block h-full w-1/4 bg-primary" />
            <span className="sr-only">Loading</span>
        </div>
    );
}
