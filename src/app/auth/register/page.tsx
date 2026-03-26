import RegistrationForm from '@/features/auth/components/RegistrationForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background blobs for a modern/premium feel */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
      
      {/* Brand Header */}
      <div className="mb-8 text-center z-10 w-full max-w-xl flex items-center justify-between">
         {/* Using a sleek typography treatment for the logo as requested by user */}
        <h1 className="text-4xl font-black tracking-tighter text-indigo-900 drop-shadow-sm">
          SU<span className="text-indigo-600">pplements</span>
        </h1>
        <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest hidden sm:block">
          Gücüne Güç Kat
        </div>
      </div>

      <div className="w-full relative z-10">
        <RegistrationForm />
      </div>
    </div>
  );
}
