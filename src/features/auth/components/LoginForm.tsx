'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { loginSchema, LoginFormValues } from '../schemas/login.schema';
import { loginUser } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { useCartStore } from '@/features/cart';

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const user = await loginUser(data);
      useAuthStore.getState().setUser(user);
      // Trigger cart merge after login
      useCartStore.getState().mergeWithServer();
      router.push('/');
    } catch (err) {
      setApiError(
        typeof err === 'string'
          ? err
          : err instanceof Error
            ? err.message
            : 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

        {/* API Error Banner */}
        {apiError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {apiError}
          </div>
        )}

        {/* Email */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">* E-Posta</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              {...register('email')}
              className={`w-full text-gray-900 placeholder:text-gray-400 pl-10 pr-4 py-2 bg-gray-50 border rounded-xl outline-none transition-all duration-200 focus:bg-white focus:ring-4 ${errors.email
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-100 hover:border-gray-300'
                }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 ml-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative pt-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">* Şifre</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              {...register('password')}
              className={`w-full text-gray-900 placeholder:text-gray-400 pl-10 pr-4 py-2 bg-gray-50 border rounded-xl outline-none transition-all duration-200 focus:bg-white focus:ring-4 ${errors.password
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-100 hover:border-gray-300'
                }`}
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 ml-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end pt-1">
          <a
            href="#"
            className="text-sm font-bold text-gray-900 underline decoration-2 underline-offset-4 hover:text-indigo-600 transition-colors"
          >
            Şifremi Unuttum?
          </a>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full group flex items-center justify-center gap-2 py-3 rounded-2xl text-base font-black tracking-wide text-white transition-all duration-300 shadow-xl shadow-indigo-600/20 
              ${isSubmitting
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/40 active:scale-[0.98]'
              }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                İşleniyor...
              </>
            ) : (
              'GİRİŞ YAP'
            )}
          </button>
        </div>
      </form>

      {/* Social Login Section (Bottom) */}
      <div className="mt-8 pt-6 border-t border-gray-200 w-full">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Google */}
          <button className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 bg-white">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <div className="text-[10px] sm:text-[11px] font-semibold leading-tight text-center">
              <span className="block font-bold text-[12px] sm:text-[13px] text-gray-900">Google</span>
              ile Giriş Yap
            </div>
          </button>

          {/* Facebook */}
          <button className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 bg-[#4267B2] text-white rounded-xl hover:bg-[#365899] transition-colors shadow-sm">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <div className="text-[10px] sm:text-[11px] font-medium leading-tight text-center text-blue-100">
              <span className="block font-bold text-[12px] sm:text-[13px] text-white">Facebook</span>
              ile Giriş Yap
            </div>
          </button>

          {/* Apple */}
          <button className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 bg-black text-white rounded-xl hover:bg-black/80 transition-colors shadow-sm">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" display="none" />
              <path d="M16.365 15.3c-1.124-.035-2.222-.44-3.155-1.16-.948.72-2.074 1.135-3.235 1.16-2.185.035-4.223-1.49-5.118-3.52-.942-2.144-.308-4.665 1.545-6.085.874-.683 1.955-1.05 3.055-1.04 1.25.044 2.45.54 3.324 1.385.83-.87 1.986-1.386 3.208-1.43 1.107-.01 2.203.354 3.09 1.03 1.876 1.417 2.534 3.961 1.583 6.12-.89 2.045-2.928 3.585-5.118 3.565zm-1.89-6.305c-.328-.905-.884-1.706-1.608-2.316-.76-.046-1.52.195-2.126.67-.624.502-1.046 1.205-1.2 1.98-.047.234-.047.476 0 .71.32.903.87 1.705 1.588 2.324.777.058 1.554-.18 2.164-.66.626-.504 1.05-1.214 1.2-1.997.05-.236.05-.48 0-.718L14.475 9z" fill="#fff" display="none" />
              <path d="M16.338 16.273c-.562 0-.824-.367-1.706-.367-.882 0-1.144.367-1.706.367-.935 0-2.404-.908-3.078-2.585-.826-2.074-.35-4.832 1.488-6.14 1.025-.664 2.122-.843 2.75-.843.83 0 1.83.25 2.502.825.2.172.936.85.936.85s-.557.734-.863 1.04c-.161-.161-.532-.505-1.11-.505-.715 0-1.265.413-1.55 1.055-.386.87-.038 2.12.806 2.9.431.395 1.01.624 1.625.624.629 0 1.22-.244 1.666-.67.33-.312.885-1.045.885-1.045s.265.404.793 1.18c-.894 2.16-2.32 3.32-3.435 3.32zm-2.812-7.854c-.61-.092-1.175-.436-1.565-.954-.367-.44-.55-1.045-.55-1.66 0-.275.048-.55.138-.808.625-.092 1.24.238 1.643.766.367.436.568 1.02.568 1.615 0 .348-.073.69-.215 1.01v.03z" />
            </svg>
            <div className="text-[10px] sm:text-[11px] font-medium leading-tight text-center text-gray-300">
              <span className="block font-bold text-[12px] sm:text-[13px] text-white">Apple</span>
              ile Giriş Yap
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
