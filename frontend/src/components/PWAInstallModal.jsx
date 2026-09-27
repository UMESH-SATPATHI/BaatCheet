import { Download, ExternalLink, Smartphone, X } from "lucide-react";
import { usePWAInstall } from "../lib/PWAInstallContext";

export default function PWAInstallModal() {
  const { isOpen, platform, canInstall, install, closeInstall } = usePWAInstall();
  if (!isOpen) return null;

  const isIOS = platform === "ios";
  const isInstalled = platform === "installed";
  const title = isInstalled ? "BaatCheet is installed" : isIOS ? "Add BaatCheet to your Home Screen" : "Install BaatCheet";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs" onClick={closeInstall}>
      <section role="dialog" aria-modal="true" aria-labelledby="pwa-install-title" onClick={(event) => event.stopPropagation()} className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#16161b] p-5 sm:p-6 shadow-2xl">
        <button type="button" onClick={closeInstall} aria-label="Close install dialog" className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800/60 text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
          <X className="h-4 w-4" />
        </button>
        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
          {isIOS ? <Smartphone className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        </div>
        <h2 id="pwa-install-title" className="text-sm font-semibold text-zinc-100">{title}</h2>
        {isInstalled ? (
          <p className="mt-1.5 text-xs text-zinc-400">Open it from your app launcher for a focused messaging experience.</p>
        ) : isIOS ? (
          <ol className="mt-2.5 space-y-1.5 text-xs text-zinc-300">
            <li>1. Tap the Share button in Safari.</li>
            <li>2. Choose “Add to Home Screen”.</li>
            <li>3. Tap “Add” to finish.</li>
          </ol>
        ) : canInstall ? (
          <p className="mt-1.5 text-xs text-zinc-400">Install BaatCheet for quick access in its own app window.</p>
        ) : (
          <p className="mt-1.5 text-xs text-zinc-400">Use your browser’s menu and choose “Install app” or “Add to Home Screen” when available.</p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={closeInstall} className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:text-white hover:bg-zinc-800">Close</button>
          {canInstall && <button type="button" onClick={install} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"><Download className="h-3.5 w-3.5" /> Install app</button>}
          {!canInstall && !isIOS && !isInstalled && <ExternalLink className="h-4 w-4 text-zinc-600" aria-hidden="true" />}
        </div>
      </section>
    </div>
  );
}