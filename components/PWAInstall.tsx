'use client';

import * as React from 'react';
import { Download } from 'lucide-react';

export default function PWAInstall({ isCompact = false }: { isCompact?: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isInstallable, setIsInstallable] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [isInIframe, setIsInIframe] = React.useState(false);

  React.useEffect(() => {
    const inIframe = window.self !== window.top;
    setIsInIframe(inIframe);

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
    } else if (inIframe) {
      setIsInstallable(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInIframe) {
      alert('Per installare l\'app, devi prima aprirla in una nuova scheda cliccando sul tasto in alto a destra nel pannello di controllo.');
      return;
    }

    if (isIOS) {
      alert('Per installare su iOS: \n1. Tocca il tasto "Condividi" (il quadrato con la freccia in alto)\n2. Scorri e seleziona "Aggiungi alla schermata Home"');
      return;
    }

    if (!deferredPrompt) {
      alert('Il browser non è ancora pronto per l\'installazione. Riprova tra qualche secondo o assicurati di usare Chrome/Edge.');
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (!isInstallable) return isCompact ? <div className="w-10" /> : null;

  if (isCompact) {
    return (
      <button
        onClick={handleInstallClick}
        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
        title="Installa App"
      >
        <Download size={24} />
      </button>
    );
  }

  return (
    <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
      <p className="text-xs font-bold text-indigo-600 uppercase mb-2">App Disponibile</p>
      <button
        onClick={handleInstallClick}
        className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
      >
        <Download size={16} />
        {isInIframe ? 'Come Installare' : (isIOS ? 'Come Installare' : 'Installa App')}
      </button>
    </div>
  );
}
