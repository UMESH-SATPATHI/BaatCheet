import { Download, ExternalLink, Smartphone, X } from "lucide-react";
import { usePWAInstall } from "../lib/PWAInstallContext";

export default function PWAInstallModal() {
  const { isOpen, platform, canInstall, install, closeInstall } = usePWAInstall();
  if (!isOpen) return null;

  const isIOS = platform === "ios";
  const isInstalled = platform === "installed";
  const title = isInstalled ? "BaatCheet is installed" : isIOS ? "Add BaatCheet to your Home Screen" : "Install BaatCheet";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={closeInstall}>
      <section role="dialog" aria-modal="true" aria-labelledby="pwa-install-title" onClick={(event) => event.stopPropagation()} className="relative w-full max-w-sm rounded-3xl border border-zinc-800 bg-[#181820]/95 p-6 shadow-2xl">
        <button type="button" onClick={closeInstall} aria-label="Close install dialog" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition hover:bg-zinc-700 hover:text-white">
          <X className="h-4 w-4" />
        </button>
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-300">
          {isIOS ? <Smartphone className="h-5 w-5" /> : <Download className="h-5 w-5" />}
        </div>
        <h2 id="pwa-install-title" className="text-lg font-bold text-white">{title}</h2>
        {isInstalled ? (
          <p className="mt-2 text-sm text-zinc-400">Open it from your Home Screen or app launcher for a focused messaging experience.</p>
        ) : isIOS ? (
          <ol className="mt-3 space-y-2 text-sm text-zinc-300">
            <li>1. Tap the Share button in Safari.</li>
            <li>2. Choose “Add to Home Screen”.</li>
            <li>3. Tap “Add” to finish.</li>
          </ol>
        ) : canInstall ? (
          <p className="mt-2 text-sm text-zinc-400">Install BaatCheet for quick access in its own app window.</p>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">Use your browser’s menu and choose “Install app” or “Add to Home Screen” when available.</p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={closeInstall} className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 transition hover:text-white">Close</button>
          {canInstall && <button type="button" onClick={install} className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-purple-500"><Download className="h-4 w-4" /> Install app</button>}
          {!canInstall && !isIOS && !isInstalled && <ExternalLink className="h-4 w-4 text-zinc-600" aria-hidden="true" />}
        </div>
      </section>
    </div>
  );
}