'use client';

import React from 'react';
import Link from 'next/link';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';

interface AuthWidgetProps {
  initialTab?: 'login' | 'register';
}

export default function AuthWidget({ initialTab = 'register' }: AuthWidgetProps) {
  return (
    <div className="w-full max-w-lg mx-auto p-6 sm:p-7 bg-white/70 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
      
      {/* Tabs */}
      <div className="flex w-full relative mb-5 border-b border-gray-200">
        <Link
          href="/auth/login"
          replace
          className={`flex-1 pb-2.5 text-center font-semibold text-base transition-colors duration-200 block ${
            initialTab === 'login'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Giriş Yap
        </Link>
        <Link
          href="/auth/register"
          replace
          className={`flex-1 pb-2.5 text-center font-semibold text-base transition-colors duration-200 block ${
            initialTab === 'register'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Üye Ol
        </Link>
      </div>

      {initialTab === 'login' ? <LoginForm /> : <RegistrationForm />}
    </div>
  );
}
