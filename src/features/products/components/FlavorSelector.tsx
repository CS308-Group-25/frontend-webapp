'use client';

import { Check } from 'lucide-react';
import { ProductFlavor } from '../types/product.types';

interface FlavorSelectorProps {
  flavors: ProductFlavor[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function FlavorSelector({ flavors, selectedId, onSelect }: FlavorSelectorProps) {
  if (!flavors || flavors.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-slate-900">
        Aroma:
      </h3>
      <div className="flex flex-wrap gap-3">
        {flavors.map((flavor) => {
          const isActive = flavor.id === selectedId;
          return (
            <button
              key={flavor.id}
              onClick={() => onSelect(flavor.id)}
              className="group flex flex-col items-center gap-1.5"
              title={flavor.name}
            >
              {/* Circular Swatch */}
              <div
                className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-200 sm:h-16 sm:w-16 ${
                  isActive
                    ? 'border-indigo-500 shadow-lg shadow-indigo-200/50 scale-110'
                    : 'border-slate-200 hover:border-indigo-300 hover:scale-105'
                }`}
              >
                <div
                  className="h-10 w-10 rounded-full sm:h-12 sm:w-12"
                  style={{ backgroundColor: flavor.color }}
                />
                {/* Checkmark overlay */}
                {isActive && (
                  <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 shadow-sm">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              {/* Label */}
              <span
                className={`text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-indigo-700' : 'text-slate-500 group-hover:text-slate-700'
                }`}
              >
                {flavor.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
