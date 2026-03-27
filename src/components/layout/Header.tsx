'use client';

import React from 'react';
import Link from 'next/link';
import { User, ChevronDown, LogIn, UserPlus } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full py-4 px-4 sm:px-6 lg:px-8 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100 sticky top-0 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 transition-all hover:opacity-90 active:scale-95">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-indigo-900 drop-shadow-sm select-none">
            SU<span className="text-indigo-600 transition-colors group-hover:text-indigo-500">pplements</span>
          </h1>
        </Link>
        
        {/* Navigation / Actions */}
        <div className="flex items-center gap-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:block">
            Gücüne Güç Kat
          </div>

          {/* Account Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition-all hover:bg-white hover:border-indigo-200 hover:text-indigo-600 hover:shadow-sm">
              <div className="p-1 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <User className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline">Hesap</span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:rotate-180 transition-all duration-300" />
            </button>

            {/* Dropdown Menu (Hover Triggered) */}
            <div className="absolute right-0 top-full pt-2 w-56 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 z-50">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-indigo-500/10 overflow-hidden p-1.5 flex flex-col gap-1">
                <Link 
                  href="/auth/register" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors group/item"
                >
                  <div className="p-2 bg-slate-50 rounded-lg group-hover/item:bg-indigo-100 transition-colors">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Üye Ol</span>
                    <span className="text-[10px] text-slate-400 font-medium tracking-tight">Üyeliğini başlat</span>
                  </div>
                </Link>
                
                <div className="h-px bg-slate-100 mx-2" />

                <Link 
                  href="/auth/login" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors group/item"
                >
                  <div className="p-2 bg-slate-50 rounded-lg group-hover/item:bg-indigo-100 transition-colors">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">Üye Girişi</span>
                    <span className="text-[10px] text-slate-400 font-medium tracking-tight">Hesabına eriş</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
