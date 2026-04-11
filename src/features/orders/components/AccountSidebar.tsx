'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UserCog,
  Package,
  MapPin,
  Gift,
  Heart,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/account', label: 'Hesap Bilgilerim', icon: UserCog },
  { href: '/orders', label: 'Siparişlerim', icon: Package },
  { href: '/account/addresses', label: 'Adreslerim', icon: MapPin },
  { href: '/account/draws', label: 'Çekilişlerim', icon: Gift },
  { href: '/account/favorites', label: 'Favorilerim', icon: Heart },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <h1 className="text-2xl font-black text-slate-900 mb-4 px-1">Hesabım</h1>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
