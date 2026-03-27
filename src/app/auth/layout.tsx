import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col justify-start items-center relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
      {/* Decorative background blobs for a modern/premium feel */}
      <div className="absolute top-20 -left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 -right-10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-40 left-1/4 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      
      {/* Page Content Injection */}
      <div className="w-full max-w-xl relative z-10 transition-all duration-700 animate-in fade-in zoom-in-95">
        {children}
      </div>
    </div>
  );
}
