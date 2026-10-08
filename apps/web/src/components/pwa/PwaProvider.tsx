"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaProvider() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      /* ignore offline register failures in dev */
    });
  }, []);

  useEffect(() => {
    function onPrompt(event: Event) {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!visible || !deferred) return null;

  return (
    <div className="fixed inset-x-12 bottom-[calc(88px+env(safe-area-inset-bottom))] z-[60] mx-auto max-w-[420px] rounded-[14px] border border-border bg-bg-elevated p-16 shadow-[0_12px_40px_rgb(26_22_48/20%)] md:bottom-24">
      <p className="font-display text-[15px] font-semibold text-brand-navy">Install PixelForge</p>
      <p className="mt-6 text-[13px] text-text-muted">
        Add to your home screen — works like an app, offline shell included.
      </p>
      <div className="mt-14 flex gap-8">
        <Button
          className="min-h-40 flex-1 text-[13px] uppercase tracking-[0.06em]"
          onClick={async () => {
            await deferred.prompt();
            const choice = await deferred.userChoice;
            setVisible(false);
            setDeferred(null);
            if (choice.outcome === "dismissed") {
              /* keep quiet */
            }
          }}
        >
          Install
        </Button>
        <Button
          variant="secondary"
          className="min-h-40 flex-1 text-[13px] uppercase tracking-[0.06em]"
          onClick={() => {
            setVisible(false);
            setDeferred(null);
          }}
        >
          Not now
        </Button>
      </div>
    </div>
  );
}
