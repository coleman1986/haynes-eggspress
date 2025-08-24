"use client";
import { useEffect, useState } from "react";

export default function AddToHomePrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="card mt-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-medium">Install Haynes Eggspress</div>
          <div className="text-sm text-gray-600">Add the app to your home screen for quick access.</div>
        </div>
        <button
          className="btn"
          onClick={async () => {
            if (!deferred) return;
            deferred.prompt();
            const res = await deferred.userChoice;
            setVisible(false);
          }}
        >
          Install
        </button>
      </div>
    </div>
  );
}
