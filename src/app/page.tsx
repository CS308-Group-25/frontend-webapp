import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-transparent">
      <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-5xl font-extrabold tracking-tight text-slate-900">
          Geleceğin Enerjisi Burada.
        </h2>
        <p className="text-xl text-slate-600 leading-relaxed">
          SUpplements ile performansını zirveye taşı. En saf içerikler, en yüksek verim.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/search"
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            Alışverişe Başla
          </Link>
        </div>
      </div>
    </div>
  );
}
