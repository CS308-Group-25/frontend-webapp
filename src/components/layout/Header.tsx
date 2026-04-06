'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, ChevronDown, LogIn, UserPlus, LogOut, UserCog, Package } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { logoutUser } from '@/features/auth/api/auth.api';

export default function Header() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Even if the API call fails, clear client state
    } finally {
      useAuthStore.getState().clearUser();
      router.push('/');
    }
  };

  // Get user initials for the avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

          {/* Show skeleton while loading */}
          {isLoading ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-slate-200" />
              <div className="hidden sm:block w-16 h-4 rounded bg-slate-200" />
            </div>
          ) : isAuthenticated && user ? (
            /* ── Authenticated User Menu ── */
            <div className="relative group">
              <button className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm transition-all hover:bg-white hover:border-indigo-200 hover:text-indigo-600 hover:shadow-sm">
                {/* User Avatar with Initials */}
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold group-hover:bg-indigo-700 transition-colors">
                  {getInitials(user.name)}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:rotate-180 transition-all duration-300" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full pt-2 w-56 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 z-50">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-indigo-500/10 overflow-hidden p-1.5 flex flex-col gap-1">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>

                  {/* Hesap */}
                  <Link
                    href="/account"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors group/item"
                  >
                    <div className="p-2 bg-slate-50 rounded-lg group-hover/item:bg-indigo-100 transition-colors">
                      <UserCog className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold">Hesap</span>
                      <span className="text-[10px] text-slate-400 font-medium tracking-tight">Hesap bilgilerin</span>
                    </div>
                  </Link>

                  {/* Siparişlerim */}
                  <Link
                    href="/orders"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors group/item"
                  >
                    <div className="p-2 bg-slate-50 rounded-lg group-hover/item:bg-indigo-100 transition-colors">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold">Siparişlerim</span>
                      <span className="text-[10px] text-slate-400 font-medium tracking-tight">Sipariş takibi</span>
                    </div>
                  </Link>

                  <div className="h-px bg-slate-100 mx-2" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors group/item w-full"
                  >
                    <div className="p-2 bg-slate-50 rounded-lg group-hover/item:bg-red-100 transition-colors">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold">Çıkış Yap</span>
                      <span className="text-[10px] text-slate-400 font-medium tracking-tight">Oturumu kapat</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Guest Menu ── */
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
          )}
        </div>
      </div>
    </header>
  );
}
