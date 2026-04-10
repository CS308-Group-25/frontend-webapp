import { Edit, Trash2, Star } from 'lucide-react';
import { Product, StockBadge } from '@/features/products';
import Image from 'next/image';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-lg font-medium text-slate-500">Kayıtlı ürün bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-bold">Ürün</th>
              <th className="px-6 py-4 font-bold">Fiyat</th>
              <th className="px-6 py-4 font-bold">Kategori</th>
              <th className="px-6 py-4 font-bold">Değerlendirme</th>
              <th className="px-6 py-4 font-bold">Stok Durumu</th>
              <th className="px-6 py-4 font-bold text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr
                key={product.id}
                className="transition-colors duration-200 hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                          sizes="48px"
                        />
                      ) : (
                        <div className="h-full w-full bg-slate-200" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{product.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {product.price.toLocaleString('tr-TR')} TL
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {product.category || 'Belirtilmemiş'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Star className={`h-4 w-4 ${product.rating > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    <span className="font-semibold text-slate-700">{product.rating > 0 ? product.rating.toFixed(1) : '-'}</span>
                    <span className="text-xs text-slate-400">({product.reviewCount || 0})</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StockBadge status={product.stockStatus} count={product.stockCount} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-50 active:scale-95"
                      title="Düzenle"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 active:scale-95"
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
    </div>
  );
}
