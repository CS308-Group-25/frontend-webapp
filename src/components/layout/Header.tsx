'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Heart,
  Bell,
  ClipboardList,
  MessageSquare,
  RotateCcw,
  FileText,
  Layers,
  LineChart,
  Percent,
} from 'lucide-react';
import { useAuthStore, logoutUser } from '@/features/auth';
import { useCartStore, CartDrawer } from '@/features/cart';
import { useWishlistStore } from '@/features/wishlist';
import { useNotificationsStore } from '@/features/notifications/store/notifications.store';

const categories = [
  { label: 'Protein Tozu', href: '/search?q=Protein+Tozu' },
  { label: 'Spor Gıdaları', href: '/search?q=Spor+G%C4%B1dalar%C4%B1' },
  { label: 'Vitamin', href: '/search?q=Vitamin' },
  { label: 'Amino Asit', href: '/search?q=Amino+Asit' },
  { label: 'Sağlık', href: '/search?q=Sa%C4%9Fl%C4%B1k' },
  {
    label: 'Bar & Atıştırmalık',
    href: '/search?q=Bar+%26+At%C4%B1%C5%9Ft%C4%B1rmal%C4%B1k',
  },
  { label: 'Aksesuar', href: '/search?q=Aksesuar' },
];

export default function Header() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { items: cartItems, openDrawer } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const {
    items: notifications,
    fetch: fetchNotifications,
    markRead,
    remove: removeNotification,
  } = useNotificationsStore();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [isProductManagerPanelOpen, setIsProductManagerPanelOpen] =
    useState(false);
  const [isSalesManagerPanelOpen, setIsSalesManagerPanelOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const isCustomer = isAuthenticated && user?.role === 'customer';

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const isProductManager = isAuthenticated && user?.role === 'product_manager';
  const isSalesManager = isAuthenticated && user?.role === 'sales_manager';

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
      setSearchValue('');
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/70 backdrop-blur-md transition-all duration-300">
      {/* Top Bar */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 transition-all hover:opacity-90 active:scale-95"
        >
          <h1 className="text-2xl font-black tracking-tighter text-indigo-900 drop-shadow-sm select-none sm:text-3xl">
            SU
            <span className="text-indigo-600 transition-colors group-hover:text-indigo-500">
              pplements
            </span>
          </h1>
        </Link>

        {/* Search Bar — fixed width, doesn't shift with account button */}
        <form
          onSubmit={handleSearch}
          className="relative hidden w-full max-w-xl sm:flex"
        >
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Ürün ara..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pr-20 pl-4 text-sm font-medium text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700 active:scale-95"
          >
            <Search className="h-3.5 w-3.5" />
            Ara
          </button>
        </form>

        {/* Navigation / Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
          {/* Wishlist Icon */}
          <Link
            href="/wishlist"
            id="header-wishlist-link"
            aria-label="Favorilerim"
            className="group relative flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 transition-all hover:bg-slate-50 hover:text-red-500"
          >
            <div className="relative">
              <Heart className="h-5 w-5 transition-transform group-hover:scale-110" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white transition-all group-hover:bg-red-600">
                  {wishlistItems.length}
                </span>
              )}
            </div>
            <span className="hidden text-sm font-bold tracking-tight uppercase md:inline">
              Favoriler
            </span>
          </Link>

          {/* Notification Bell — customers only */}
          {isCustomer && (
            <div ref={notifRef} className="relative">
              <button
                onClick={() => {
                  const opening = !isNotifOpen;
                  setIsNotifOpen(opening);
                  if (opening) fetchNotifications();
                }}
                className="group relative flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 transition-all hover:bg-slate-50 hover:text-indigo-600"
                aria-label="Bildirimler"
              >
                <div className="relative">
                  <Bell className="h-5 w-5 transition-transform group-hover:scale-110" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                      {notifications.length}
                    </span>
                  )}
                </div>
              </button>
              {isNotifOpen && (
                <div className="absolute top-full right-0 z-50 w-80 pt-2">
                  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-indigo-500/10">
                    <div className="border-b border-slate-100 px-4 py-3 text-sm font-extrabold text-slate-900">
                      Bildirimler
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-5 text-center text-sm text-slate-400">
                        Yeni bildirim yok.
                      </p>
                    ) : (
                      <ul className="max-h-72 divide-y divide-slate-50 overflow-y-auto">
                        {notifications.map((n) => (
                          <li key={n.id} className="px-4 py-3">
                            <p className="mb-2 text-sm leading-relaxed text-slate-700">
                              {n.message}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => markRead(n.id)}
                                className="text-[11px] font-semibold text-indigo-600 hover:underline"
                              >
                                Okundu
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                onClick={() => removeNotification(n.id)}
                                className="text-[11px] font-semibold text-red-500 hover:underline"
                              >
                                Sil
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart Icon */}
          <button
            onClick={openDrawer}
            className="group relative flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 transition-all hover:bg-slate-50 hover:text-indigo-600"
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white transition-all group-hover:bg-indigo-700">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden text-sm font-bold tracking-tight uppercase md:inline">
              Sepet
            </span>
          </button>

          {/* Show skeleton while loading */}
          {isLoading ? (
            <div className="flex animate-pulse items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
              <div className="h-7 w-7 rounded-lg bg-slate-200" />
              <div className="hidden h-4 w-16 rounded bg-slate-200 sm:block" />
            </div>
          ) : isAuthenticated && user ? (
            /* ── Authenticated User Menu ── */
            <div className="group relative">
              <button className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-indigo-200 hover:bg-white hover:text-indigo-600 hover:shadow-sm">
                {/* User Avatar with Initials */}
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white transition-colors group-hover:bg-indigo-700">
                  {getInitials(user.name)}
                </div>
                <span className="hidden max-w-[120px] truncate sm:inline">
                  {user.name}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-all duration-300 group-hover:rotate-180 group-hover:text-indigo-500" />
              </button>

              {/* Dropdown Menu */}
              <div className="invisible absolute top-full right-0 z-50 w-56 translate-y-2 pt-2 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="flex flex-col gap-1 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-2xl shadow-indigo-500/10">
                  {/* User Info Header */}
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {user.email}
                    </p>
                  </div>

                  {/* Account */}
                  <Link
                    href="/account"
                    className="group/item flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <div className="rounded-lg bg-slate-50 p-2 transition-colors group-hover/item:bg-indigo-100">
                      <UserCog className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold">Hesap</span>
                      <span className="text-[10px] font-medium tracking-tight text-slate-400">
                        Hesap bilgilerin
                      </span>
                    </div>
                  </Link>

                  {/* My Orders */}
                  <Link
                    href="/orders"
                    className="group/item flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <div className="rounded-lg bg-slate-50 p-2 transition-colors group-hover/item:bg-indigo-100">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold">Siparişlerim</span>
                      <span className="text-[10px] font-medium tracking-tight text-slate-400">
                        Sipariş takibi
                      </span>
                    </div>
                  </Link>

                  {/* Wishlist */}
                  <Link
                    href="/wishlist"
                    className="group/item flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <div className="rounded-lg bg-slate-50 p-2 transition-colors group-hover/item:bg-red-100">
                      <Heart className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold">Favorilerim</span>
                      <span className="text-[10px] font-medium tracking-tight text-slate-400">
                        {wishlistItems.length > 0
                          ? `${wishlistItems.length} ürün kaydedildi`
                          : 'Kaydedilen ürünler'}
                      </span>
                    </div>
                  </Link>

                  <div className="mx-2 h-px bg-slate-100" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="group/item flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <div className="rounded-lg bg-slate-50 p-2 transition-colors group-hover/item:bg-red-100">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold">Çıkış Yap</span>
                      <span className="text-[10px] font-medium tracking-tight text-slate-400">
                        Oturumu kapat
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Guest Menu ── */
            <div className="group relative">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-indigo-200 hover:bg-white hover:text-indigo-600 hover:shadow-sm">
                <div className="rounded-lg bg-indigo-100 p-1 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline">Hesap</span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-all duration-300 group-hover:rotate-180 group-hover:text-indigo-500" />
              </button>

              {/* Dropdown Menu (Hover Triggered) */}
              <div className="invisible absolute top-full right-0 z-50 w-56 translate-y-2 pt-2 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="flex flex-col gap-1 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-2xl shadow-indigo-500/10">
                  <Link
                    href="/auth/register"
                    className="group/item flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <div className="rounded-lg bg-slate-50 p-2 transition-colors group-hover/item:bg-indigo-100">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">Üye Ol</span>
                      <span className="text-[10px] font-medium tracking-tight text-slate-400">
                        Üyeliğini başlat
                      </span>
                    </div>
                  </Link>

                  <div className="mx-2 h-px bg-slate-100" />

                  <Link
                    href="/auth/login"
                    className="group/item flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <div className="rounded-lg bg-slate-50 p-2 transition-colors group-hover/item:bg-indigo-100">
                      <LogIn className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">Üye Girişi</span>
                      <span className="text-[10px] font-medium tracking-tight text-slate-400">
                        Hesabına eriş
                      </span>
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
            className="w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pr-16 pl-4 text-sm font-medium text-slate-900 transition-all outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center gap-1 rounded-md bg-indigo-600 px-3 py-1 text-xs font-bold text-white"
          >
            <Search className="h-3.5 w-3.5" />
            Ara
          </button>
        </form>
      </div>

      {/* Category Navigation */}
      <nav className="relative border-t border-slate-50 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1">
            <div className="scrollbar-hide flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
              <Link
                href="/search"
                className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold tracking-wide text-indigo-600 uppercase transition-all hover:bg-indigo-50"
              >
                Tüm Ürünler
              </Link>
              <div className="h-4 w-px shrink-0 bg-slate-200" />
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
            {isProductManager && (
              <>
                <div className="h-4 w-px shrink-0 bg-slate-200" />
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setIsProductManagerPanelOpen((current) => !current)
                    }
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition-all hover:bg-indigo-100 focus:outline-none"
                    aria-expanded={isProductManagerPanelOpen}
                  >
                    Product Manager Panel
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        isProductManagerPanelOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isProductManagerPanelOpen && (
                    <div className="absolute top-full right-0 z-50 mt-2 w-56 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-indigo-500/10">
                      <Link
                        href="/admin/products"
                        onClick={() => setIsProductManagerPanelOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Package className="h-4 w-4" />
                        Ürün Yönetimi
                      </Link>
                      <Link
                        href="/admin/categories"
                        onClick={() => setIsProductManagerPanelOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Layers className="h-4 w-4" />
                        Kategori Yönetimi
                      </Link>
                      <Link
                        href="/admin/orders"
                        onClick={() => setIsProductManagerPanelOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <ClipboardList className="h-4 w-4" />
                        Teslimat Kuyruğu
                      </Link>
                      <Link
                        href="/admin/reviews"
                        onClick={() => setIsProductManagerPanelOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Yorum Moderasyonu
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
            {isSalesManager && (
              <>
                <div className="h-4 w-px shrink-0 bg-slate-200" />
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setIsSalesManagerPanelOpen((current) => !current)
                    }
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition-all hover:bg-indigo-100 focus:outline-none"
                    aria-expanded={isSalesManagerPanelOpen}
                  >
                    Sales Manager Panel
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${
                        isSalesManagerPanelOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isSalesManagerPanelOpen && (
                    <div className="absolute top-full right-0 z-50 mt-2 w-56 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-indigo-500/10">
                      <Link
                        href="/admin/products"
                        onClick={() => setIsSalesManagerPanelOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Package className="h-4 w-4" />
                        Ürün Fiyatlandırma
                      </Link>
                      <Link
                        href="/admin/refunds"
                        onClick={() => setIsSalesManagerPanelOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <RotateCcw className="h-4 w-4" />
                        İade Talepleri
                      </Link>
                      <Link
                        href="/admin/invoices"
                        onClick={() => setIsSalesManagerPanelOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <FileText className="h-4 w-4" />
                        Faturalar
                      </Link>
                      <Link
                        href="/admin/revenue"
                        onClick={() => setIsSalesManagerPanelOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <LineChart className="h-4 w-4" />
                        Gelir Raporu
                      </Link>
                      <Link
                        href="/admin/discounts"
                        onClick={() => setIsSalesManagerPanelOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Percent className="h-4 w-4" />
                        İndirim Yönetimi
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <CartDrawer />
    </header>
  );
}
