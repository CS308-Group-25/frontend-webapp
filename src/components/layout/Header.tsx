'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ChevronDown,
  LogIn,
  UserPlus,
  LogOut,
  UserCog,
  Package,
  Search,
  ShoppingCart,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useCartStore } from '@/features/cart';
import { logoutUser } from '@/features/auth/api/auth.api';

const categories = [
  { label: 'Protein', href: '/search?q=protein' },
  { label: 'Spor Gıdaları', href: '/search?q=spor' },
  { label: 'Vitamin', href: '/search?q=vitamin' },
  { label: 'Amino Asit', href: '/search?q=amino' },
  { label: 'Sağlık', href: '/search?q=sağlık' },
  { label: 'Bar & Atıştırmalık', href: '/search?q=bar' },
  { label: 'Aksesuar', href: '/search?q=aksesuar' },
];

export default function Header() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
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
    <header className="w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-100 sticky top-0 transition-all duration-300">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto flex items-center gap-4 py-3 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 shrink-0 transition-all hover:opacity-90 active:scale-95">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-indigo-900 drop-shadow-sm select-none">
            SU<span className="text-indigo-600 transition-colors group-hover:text-indigo-500">pplements</span>
          </h1>
        </Link>

        {/* Search Bar — fixed width, doesn't shift with account button */}
        <form onSubmit={handleSearch} className="hidden sm:flex w-full max-w-xl relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Ürün ara..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-4 pr-20 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors active:scale-95"
          >
            <Search className="h-3.5 w-3.5" />
            Ara
          </button>
        </form>
        
        {/* Navigation / Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-auto">
          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 transition-all hover:bg-slate-50 hover:text-indigo-600 group"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white transition-all group-hover:bg-indigo-700">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline text-sm font-bold uppercase tracking-tight">Sepet</span>
          </Link>

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

                  {/* Account */}
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

                  {/* My Orders */}
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

      {/* Mobile Search (visible on small screens only) */}
      <div className="border-t border-slate-50 px-4 py-2 sm:hidden">
        <form onSubmit={handleSearch} className="relative flex">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Ürün ara..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-4 pr-16 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1 text-xs font-bold text-white"
          >
            <Search className="h-3.5 w-3.5" />
            Ara
          </button>
        </form>
      </div>

      {/* Category Navigation */}
      <nav className="border-t border-slate-50 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto py-2">
            <Link
              href="/search"
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-indigo-600 transition-all hover:bg-indigo-50"
            >
              Tüm Ürünler
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-indigo-50 hover:text-indigo-600"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
