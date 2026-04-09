'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayImages = images.length > 0 ? images : ['/products/bcaa.png'];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="group relative aspect-square overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-50 shadow-sm">
        <Image
          src={displayImages[selectedIndex]}
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
          priority
        />

        {/* Subtle glow ring on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-slate-900/5 transition-shadow duration-300 group-hover:ring-indigo-200" />
      </div>

      {/* Thumbnail Strip */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 justify-center">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 sm:h-20 sm:w-20 ${
                idx === selectedIndex
                  ? 'border-indigo-500 shadow-md shadow-indigo-200/50 scale-105'
                  : 'border-slate-200 hover:border-indigo-300 opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`${productName} - ${idx + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
