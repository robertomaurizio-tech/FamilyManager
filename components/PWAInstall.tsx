'use client';

import * as React from 'react';
import { Download } from 'lucide-react';

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isInstallable, setIsInstallable] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);

  React.useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
      setIsIOS(false);
    } else if (isIOSDevice) {
      setIsInstallable(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert('Per installare su iOS: \n1. Tocca il tasto "Condividi" (il quadrato con la freccia in alto)\n2. Scorri e seleziona "Aggiungi alla schermata Home"');
      return;
    }

    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (!isInstallable) return null;

  return (
    <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
      <p className="text-xs font-bold text-indigo-600 uppercase mb-2">App Disponibile</p>
      <button
        onClick={handleInstallClick}
        className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
      >
        <Download size={16} />
        {isIOS ? 'Come Installare' : 'Installa App'}
      </button>
    </div>
  );
}
