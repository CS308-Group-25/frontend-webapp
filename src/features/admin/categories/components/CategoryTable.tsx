import { Edit, Trash2, Tag, FolderPlus } from 'lucide-react';
import type { Category } from '../types/category.types';

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddNew?: () => void;
  isFiltered?: boolean;
}

export default function CategoryTable({
  categories,
  onEdit,
  onDelete,
  onAddNew,
  isFiltered = false,
}: CategoryTableProps) {
  if (categories.length === 0) {
    // "No search results" empty state
    if (isFiltered) {
      return (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Tag className="h-8 w-8 text-slate-300" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-slate-700">Sonuç bulunamadı</p>
            <p className="mt-1 max-w-xs text-sm text-slate-400">
              Arama kriterlerinize uygun kategori yok. Farklı bir kelime deneyin.
            </p>
          </div>
        </div>
      );
    }

    // True empty state — no categories at all
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 rounded-2xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50">
          <Tag className="h-10 w-10 text-indigo-300" />
        </div>
        <div className="text-center">
          <p className="text-lg font-extrabold text-slate-800">Henüz kategori yok</p>
          <p className="mt-1.5 max-w-xs text-sm text-slate-400">
            Ürünlerinizi düzenlemek için ilk kategoriyi ekleyerek başlayın.
          </p>
        </div>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-95"
          >
            <FolderPlus className="h-4 w-4" />
            İlk Kategoriyi Ekle
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Kategori Adı</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Açıklama</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Ürün Sayısı</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => (
              <tr
                key={category.id}
                className="group transition-colors duration-150 hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 transition-colors group-hover:bg-indigo-100">
                      <Tag className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="font-bold text-slate-900">{category.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  {category.description ? (
                    <span className="line-clamp-2 text-slate-500">{category.description}</span>
                  ) : (
                    <span className="italic text-slate-300">Açıklama yok</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                      category.productCount > 0
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {category.productCount} ürün
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(category)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
                      title="Düzenle"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(category)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 active:scale-95"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Row count footer */}
      <div className="border-t border-slate-100 bg-slate-50 px-6 py-2.5">
        <p className="text-xs text-slate-400">
          <span className="font-semibold text-slate-600">{categories.length}</span>{' '}
          kategori gösteriliyor
        </p>
      </div>
    </div>
  );
}
