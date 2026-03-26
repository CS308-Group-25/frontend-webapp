'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConsentModal({ isOpen, onClose }: ConsentModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch and ensure it only renders on client
  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-white shadow-[0_0_30px_rgba(0,0,0,0.1)] p-6 md:p-10 lg:p-12 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-500 hover:text-black transition-colors"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
        </button>
        <div className="text-[11px] sm:text-xs md:text-[13px] font-medium text-black leading-6 sm:leading-7 text-justify tracking-wide">
          "SUpplements" Gıda A.Ş. tarafından www.supplements.com websitesi aracılığıyla yeni ürünler ve kampanyaların tanıtımı başta olmak üzere, tarafıma ticari elektronik ileti gönderilmesi amacıyla SUpplements ile paylaşmış olduğum veya ilerleyen dönemlerde paylaşacağım telefon ve eposta ve mobil uygulamalar aracılığıyla adresimin kullanılmasına ve işbu iletişim araçları ile şahsımla iletişime geçilmesine, telefon ile arama yapılmasına bu kapsamda paylaşmış olduğum bilgilerin SUpplements tarafından saklanmasına, kullanılmasına ve ticari elektronik iletinin içeriğinin ve gönderiye ilişkin diğer kayıtların gerektiğinde Gümrük ve Ticaret Bakanlığı'na sunulmak üzere kayıt altına alınarak saklanmasına onay veriyorum.
        </div>
      </div>
    </div>,
    document.body
  );
}
