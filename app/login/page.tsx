'use client';

import * as React from 'react';
import { Home, Heart, Star, Sun, Moon, Cloud, Lock, Key, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { getLoginSequence } from '@/lib/actions';
import { useRouter } from 'next/navigation';

const icons = [
  { name: 'Home', component: Home },
  { name: 'Heart', component: Heart },
  { name: 'Star', component: Star },
  { name: 'Sun', component: Sun },
  { name: 'Moon', component: Moon },
  { name: 'Cloud', component: Cloud },
  { name: 'Lock', component: Lock },
  { name: 'Key', component: Key },
  { name: 'Smile', component: Smile },
];



export default function LoginPage() {
  const router = useRouter();
  const [selectedSequence, setSelectedSequence] = React.useState<string[]>([]);
  const [status, setStatus] = React.useState<'idle' | 'error' | 'success'>('idle');
  const [correctSequence, setCorrectSequence] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchSequence = async () => {
      const sequence = await getLoginSequence();
      setCorrectSequence(sequence);
    };
    fetchSequence();
  }, []);

  const handleIconClick = (iconName: string) => {
    if (status === 'success' || selectedSequence.length >= 4) return;

    const newSequence = [...selectedSequence, iconName];
    setSelectedSequence(newSequence);

    if (newSequence.length === 4) {
      checkSequence(newSequence);
    }
  };

  const checkSequence = async (sequence: string[]) => {
    const isCorrect = JSON.stringify(sequence) === JSON.stringify(correctSequence);
    if (isCorrect) {
      setStatus('success');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } else {
      setStatus('error');
      setTimeout(() => {
        setSelectedSequence([]);
        setStatus('idle');
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
      <div className="w-full max-w-sm mx-auto text-center">
        <h1 className="text-3xl font-bold font-display tracking-tight text-indigo-600">
          Accesso Sicuro
        </h1>
        <p className="mt-2 text-zinc-500">
          Seleziona la sequenza di 4 icone corretta per accedere.
        </p>

        <div className="my-8 flex justify-center items-center gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-4 h-4 rounded-full border-2 border-indigo-200 transition-colors',
                selectedSequence.length > index ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent',
                status === 'error' && 'bg-rose-500 border-rose-500'
              )}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {icons.map((icon) => (
            <motion.button
              key={icon.name}
              onClick={() => handleIconClick(icon.name)}
              whileTap={{ scale: 0.9 }}
              className="aspect-square bg-white rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <icon.component size={32} />
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {status === 'error' && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 text-rose-600 font-medium"
            >
              Sequenza errata. Riprova.
            </motion.p>
          )}
          {status === 'success' && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 text-emerald-600 font-medium"
            >
              Accesso consentito!
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
