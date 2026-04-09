import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Product, StockStatus, ProductFlavor, ProductSize } from '@/features/products/types/product.types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> | Product) => void;
  initialData?: Product;
}

export default function ProductModal({ isOpen, onClose, onSave, initialData }: ProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    stockStatus: 'in_stock',
    stockCount: 0,
    category: '',
    ingredients: '',
    usage: '',
    features: [],
    nutritionFacts: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        image: '',
        stockStatus: 'in_stock',
        stockCount: 0,
        category: '',
        ingredients: '',
        usage: '',
        features: [],
        nutritionFacts: [],
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'features') {
      setFormData((prev) => ({ ...prev, features: value.split('\n') }));
      return;
    }

    // Handle number inputs properly
    if (type === 'number') {
      setFormData((prev: any) => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddNutrition = () => {
    setFormData((prev) => ({
      ...prev,
      nutritionFacts: [...(prev.nutritionFacts || []), { label: '', perServing: '' }],
    }));
  };

  const handleNutritionChange = (index: number, field: 'label' | 'perServing' | 'per100g', value: string) => {
    setFormData((prev) => {
      const newFacts = [...(prev.nutritionFacts || [])];
      newFacts[index] = { ...newFacts[index], [field]: value };
      return { ...prev, nutritionFacts: newFacts };
    });
  };

  const handleRemoveNutrition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      nutritionFacts: (prev.nutritionFacts || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddFlavor = () => {
    setFormData((prev) => ({
      ...prev,
      flavors: [...(prev.flavors || []), { id: `flv_${Date.now()}`, name: '', color: '#E5E7EB' }],
    }));
  };

  const handleFlavorChange = (index: number, field: keyof ProductFlavor, value: string) => {
    setFormData((prev) => {
      const newFlavors = [...(prev.flavors || [])];
      newFlavors[index] = { ...newFlavors[index], [field]: value };
      return { ...prev, flavors: newFlavors };
    });
  };

  const handleRemoveFlavor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      flavors: (prev.flavors || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddSize = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...(prev.sizes || []), { id: `sz_${Date.now()}`, label: '', servings: 0, price: 0 }],
    }));
  };

  const handleSizeChange = (index: number, field: keyof ProductSize, value: string) => {
    setFormData((prev: any) => {
      const newSizes = [...(prev.sizes || [])];
      if (field === 'servings' || field === 'price' || field === 'originalPrice') {
        newSizes[index] = { ...newSizes[index], [field]: value === '' ? '' : Number(value) };
      } else {
        newSizes[index] = { ...newSizes[index], [field]: value };
      }
      return { ...prev, sizes: newSizes };
    });
  };

  const handleRemoveSize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sizes: (prev.sizes || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Product);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-xl font-extrabold text-slate-900">
            {initialData ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6">
          <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">Ürün Adı</label>
              <input
                required
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Örn: Whey Protein"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">Açıklama</label>
              <textarea
                required
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">Fiyat (TL)</label>
                <input
                  required
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price === 0 ? '' : formData.price}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">Kategori</label>
                <input
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Örn: Protein"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">Resim URL</label>
              <input
                required
                name="image"
                value={formData.image || ''}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="/products/creatine.png"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">Stok Durumu</label>
                <select
                  name="stockStatus"
                  value={formData.stockStatus || 'in_stock'}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="in_stock">Stokta Var</option>
                  <option value="low_stock">Az Kaldı</option>
                  <option value="out_of_stock">Tükendi</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-700">Stok Sayısı (Tükendi değilse)</label>
                <input
                  type="number"
                  name="stockCount"
                  min="0"
                  disabled={formData.stockStatus === 'out_of_stock'}
                  value={formData.stockStatus === 'out_of_stock' ? 0 : (formData.stockCount === 0 ? '' : formData.stockCount)}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-colors disabled:bg-slate-50 disabled:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* VARYANTLAR */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="mb-4 text-lg font-bold text-slate-800">Ürün Varyantları</h3>
              <div className="flex flex-col gap-6">
                {/* Aromalar */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">Aromalar</label>
                    <button
                      type="button"
                      onClick={handleAddFlavor}
                      className="text-sm font-bold text-indigo-600 transition-colors hover:text-indigo-700"
                    >
                      + Aroma Ekle
                    </button>
                  </div>
                  {(!formData.flavors || formData.flavors.length === 0) && (
                    <p className="text-sm text-slate-400">Ürüne ait aroma bulunmuyor.</p>
                  )}
                  <div className="flex flex-col gap-3">
                    {formData.flavors?.map((flavor, index) => (
                      <div key={index} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <input
                            required
                            placeholder="Aroma Adı (Örn: Çikolata)"
                            value={flavor.name}
                            onChange={(e) => handleFlavorChange(index, 'name', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFlavor(index)}
                            className="rounded-lg bg-white p-2 text-red-500 shadow-sm transition-colors hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 px-1">
                          <span className="text-xs font-bold text-slate-500">Renk:</span>
                          <div className="flex flex-wrap items-center gap-2">
                            {[
                              '#E5E7EB', '#5C3317', '#F3E5AB', '#E8474C',
                              '#FFE135', '#F59E0B', '#22C55E', '#3B82F6', '#7C3AED', '#1E293B'
                            ].map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => handleFlavorChange(index, 'color', c)}
                                className={`h-6 w-6 rounded-full border border-black/10 shadow-sm transition-transform hover:scale-110 ${
                                  flavor.color.toUpperCase() === c.toUpperCase()
                                    ? 'ring-2 ring-indigo-500 ring-offset-2'
                                    : ''
                                }`}
                                style={{ backgroundColor: c }}
                                title={c}
                              />
                            ))}
                            <div className="relative ml-1 h-6 w-6 cursor-pointer overflow-hidden rounded-full border border-slate-300 bg-[conic-gradient(red,yellow,green,cyan,blue,magenta,red)] shadow-inner transition-transform hover:scale-110">
                              <input
                                type="color"
                                value={flavor.color}
                                onChange={(e) => handleFlavorChange(index, 'color', e.target.value)}
                                className="absolute -inset-4 h-14 w-14 cursor-pointer opacity-0"
                                title="Özel Renk Seç"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Boyutlar */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">Boyutlar & Fiyatlar</label>
                    <button
                      type="button"
                      onClick={handleAddSize}
                      className="text-sm font-bold text-indigo-600 transition-colors hover:text-indigo-700"
                    >
                      + Boyut Ekle
                    </button>
                  </div>
                  {(!formData.sizes || formData.sizes.length === 0) && (
                    <p className="text-sm text-slate-400">Ürüne ait farklı boyut bulunmuyor.</p>
                  )}
                  <div className="flex flex-col gap-3">
                    {formData.sizes?.map((size, index) => (
                      <div key={index} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                        <input
                          required
                          placeholder="Label (Örn: 400g)"
                          value={size.label}
                          onChange={(e) => handleSizeChange(index, 'label', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1"
                        />
                        <input
                          required
                          type="number"
                          placeholder="Servis (Örn: 16)"
                          value={size.servings === 0 ? '' : (size.servings ?? '')}
                          onChange={(e) => handleSizeChange(index, 'servings', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 sm:w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <input
                          required
                          type="number"
                          placeholder="Fiyat"
                          value={size.price === 0 ? '' : (size.price ?? '')}
                          onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 sm:w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(index)}
                          className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* NEW ADDITIONS */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="mb-4 text-lg font-bold text-slate-800">Ürün Detayları</h3>
              <div className="flex flex-col gap-5">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Özellikler (Her satıra bir özellik)</label>
                  <textarea
                    name="features"
                    value={formData.features ? formData.features.join('\n') : ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder={"Şeker ilavesiz\nYüksek protein\nGlutensiz"}
                  />
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">Besin Değerleri</label>
                    <button
                      type="button"
                      onClick={handleAddNutrition}
                      className="text-sm font-bold text-indigo-600 transition-colors hover:text-indigo-700"
                    >
                      + Metrik Ekle
                    </button>
                  </div>
                  {(!formData.nutritionFacts || formData.nutritionFacts.length === 0) && (
                    <p className="text-sm text-slate-400">Henüz besin değeri eklenmemiş. Lütfen ekleyin.</p>
                  )}
                  <div className="flex flex-col gap-3">
                    {formData.nutritionFacts?.map((fact, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          required
                          placeholder="Etiket (Örn: Enerji)"
                          value={fact.label}
                          onChange={(e) => handleNutritionChange(index, 'label', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1"
                        />
                        <input
                          required
                          placeholder="Porsiyon Başı (Örn: 120 kcal)"
                          value={fact.perServing}
                          onChange={(e) => handleNutritionChange(index, 'perServing', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1"
                        />
                        <input
                          placeholder="100g Başı (Opsiyonel)"
                          value={fact.per100g || ''}
                          onChange={(e) => handleNutritionChange(index, 'per100g', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNutrition(index)}
                          className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">İçindekiler</label>
                  <textarea
                    required
                    name="ingredients"
                    value={formData.ingredients || ''}
                    onChange={handleChange}
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Örn: Whey Proteini Konsantresi, Aroma Verici..."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">Kullanım Şekli</label>
                  <textarea
                    required
                    name="usage"
                    value={formData.usage || ''}
                    onChange={handleChange}
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Örn: 1 ölçek kaşığı (30g) 200ml su ile karıştırınız."
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200 active:scale-95"
          >
            İptal
          </button>
          <button
            type="submit"
            form="product-form"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 active:scale-95"
          >
            {initialData ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
