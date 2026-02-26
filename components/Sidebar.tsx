'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  CheckSquare, 
  Palmtree, 
  Receipt,
  Menu,
  X,
  User,
  Tag,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Spese', href: '/expenses', icon: Receipt },
  { name: 'Categorie', href: '/categories', icon: Tag },
  { name: 'Lista Spesa', href: '/shopping-list', icon: ShoppingCart },
  { name: 'Lavori', href: '/tasks', icon: CheckSquare },
  { name: 'Vacanze', href: '/holidays', icon: Palmtree },
  { name: 'Spese Sandro', href: '/sandro', icon: User },
  { name: 'Impostazioni', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed inset-x-0 top-0 z-50 flex items-center justify-between py-3 px-4 bg-white border-b border-zinc-200">
        <button onClick={() => setIsOpen(!isOpen)} className="py-1 px-2 -ml-2">
          <Menu size={24} />
        </button>
        <span className="font-bold text-xl tracking-tight">FamilyManager</span>
        <div className="w-10" /> {/* Placeholder to balance space */}
      </div>

      {/* Sidebar Desktop */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-zinc-50 border-r border-zinc-200 transition-transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header for Mobile */}
        <div className="lg:hidden flex items-center justify-between py-2 px-4 bg-zinc-100 border-b border-zinc-200">
          <h1 className="text-xl font-bold tracking-tighter text-zinc-900">FamilyManager</h1>
          <button onClick={() => setIsOpen(false)} className="py-1 px-2 -mr-2">
            <X size={24} />
          </button>
        </div>
        <div className="flex flex-col h-full p-6">
          <div className="mb-10">
            <h1 className="text-2xl font-bold tracking-tighter text-zinc-900">FamilyManager</h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1 font-semibold">Home Management</p>
          </div>

          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
                    isActive 
                      ? "bg-zinc-900 text-white shadow-md" 
                      : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                  )}
                >
                  <item.icon size={20} className={cn(
                    "transition-colors",
                    isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-900"
                  )} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-zinc-200">
            <div className="p-3 bg-zinc-100 rounded-xl">
              <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-zinc-700">Online</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>


    </>
  );
}
