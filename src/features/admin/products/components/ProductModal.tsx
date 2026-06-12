/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { Check, Plus, X } from 'lucide-react';
import type { CategoryOption } from '@/features/products';
import type { Product, ProductFlavor, ProductSize } from '@/features/products';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> | Product) => void | Promise<void>;
  initialData?: Product;
  categories?: CategoryOption[];
  brandOptions?: string[];
  subCategories?: { id: number; name: string; category_id: number }[];
  categoryOptions?: Record<number, { brands: string[]; subTypes: string[] }>;
  isSaving?: boolean;
}

const DEFAULT_FLAVOR_COLOR = '#E5E7EB';
const FLAVOR_COLOR_OPTIONS = [
  DEFAULT_FLAVOR_COLOR,
  '#5C3317',
  '#D2A679',
  '#F3E5AB',
  '#E8474C',
  '#FFE135',
  '#F59E0B',
  '#C68E4E',
  '#22C55E',
  '#3B82F6',
  '#7C3AED',
  '#1E293B',
];
const FLAVOR_COLOR_BY_NAME: Record<string, string> = {
  aromasız: DEFAULT_FLAVOR_COLOR,
  çikolata: '#5C3317',
  cikolata: '#5C3317',
  bisküvi: '#D2A679',
  biskuvi: '#D2A679',
  biscuit: '#D2A679',
  cookie: '#D2A679',
  vanilya: '#F3E5AB',
  vanilla: '#F3E5AB',
  çilek: '#E8474C',
  cilek: '#E8474C',
  strawberry: '#E8474C',
  muz: '#FFE135',
  banana: '#FFE135',
  mango: '#F59E0B',
  karamel: '#C68E4E',
  caramel: '#C68E4E',
  'salted caramel': '#C68E4E',
  'orman meyveli': '#7C3AED',
  'blue raspberry': '#3B82F6',
  cola: '#78350F',
};

function normalizeFlavorName(name: string): string {
  return name.trim().toLocaleLowerCase('tr-TR');
}

function isHexColor(value?: string): value is string {
  return Boolean(value && /^#[0-9A-Fa-f]{6}$/.test(value));
}

function getFlavorColor(flavor: Partial<ProductFlavor>): string {
  if (isHexColor(flavor.color)) return flavor.color.toUpperCase();

  return FLAVOR_COLOR_BY_NAME[normalizeFlavorName(flavor.name || '')] || DEFAULT_FLAVOR_COLOR;
}

function normalizeFlavor(flavor: ProductFlavor): ProductFlavor {
  return {
    ...flavor,
    color: getFlavorColor(flavor),
  };
}

function normalizeCategoryName(value?: string): string {
  return value?.trim().toLocaleLowerCase('tr-TR') ?? '';
}

function isMissingNumber(value: unknown): boolean {
  return value === '' || value === undefined || value === null || !Number.isFinite(Number(value));
}

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories = [],
  brandOptions = [],
  subCategories = [],
  categoryOptions = {},
  isSaving = false,
}: ProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    image: '',
    stockCount: 0,
    category: '',
    categoryId: undefined,
    ingredients: '',
    usage: '',
    features: [],
    nutritionFacts: [],
  });
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const isCategorySelected = categories.length > 0
    ? Boolean(formData.categoryId)
    : Boolean(formData.category?.trim());
  const selectedCategoryOptions = (() => {
    if (formData.categoryId != null) {
      const categoryOption = categoryOptions[formData.categoryId];
      if (categoryOption) return categoryOption;
    }
    const normalizedCategory = normalizeCategoryName(formData.category);
    const matchedCategory = categories.find(
      (category) => normalizeCategoryName(category.name) === normalizedCategory,
    );
    return matchedCategory ? categoryOptions[matchedCategory.id] : undefined;
  })();
  const baseBrandOptions: string[] = brandOptions.length ? brandOptions : (selectedCategoryOptions?.brands ?? []);
  
  const normalizedBaseBrandOptions = Array.from(
    new Set(baseBrandOptions.map((option) => option?.trim()).filter((option): option is string => Boolean(option))),
  );
  
  const currentBrand = formData.brand?.trim();
  const currentSubType = formData.subType?.trim();
  
  const availableBrandOptions = currentBrand
    ? Array.from(new Set([...normalizedBaseBrandOptions, currentBrand]))
    : normalizedBaseBrandOptions;
    
  const filteredSubCategories = subCategories.filter(sub => sub.category_id === Number(formData.categoryId));
  
  const isCustomBrand = currentBrand ? !normalizedBaseBrandOptions.includes(currentBrand) : false;

  useEffect(() => {
    setIsAddingBrand(false);
    setNewBrand('');

    if (initialData) {
      setFormData({
        ...initialData,
        flavors: initialData.flavors?.map(normalizeFlavor),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        image: '',
        stockCount: 0,
        category: '',
        categoryId: undefined,
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

    if (name === 'categoryId') {
      const categoryId = value === '' ? undefined : Number(value);
      const category = categories.find((item) => item.id === categoryId);

      setFormData((prev) => ({
        ...prev,
        categoryId,
        category: category?.name || '',
        brand: '',
        subType: '',
      }));
      setIsAddingBrand(false);
      setNewBrand('');
      return;
    }

    if (name === 'category') {
      setFormData((prev) => ({
        ...prev,
        category: value,
        brand: value.trim() ? prev.brand : '',
        subType: value.trim() ? prev.subType : '',
      }));
      return;
    }

    // Handle number inputs properly
    if (name === 'brand' || name === 'subType') {
      setFormData((prev) => ({ ...prev, [name]: value.trim() }));
      return;
    }

    if (type === 'number') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFormData((prev: any) => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveCustomBrand = () => {
    const value = newBrand.trim();
    if (!value) return;

    setFormData((prev) => ({ ...prev, brand: value }));
    setNewBrand('');
    setIsAddingBrand(false);
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
      flavors: [...(prev.flavors || []), { id: `flv_${Date.now()}`, name: '', color: DEFAULT_FLAVOR_COLOR }],
    }));
  };

  const handleFlavorChange = (index: number, field: keyof ProductFlavor, value: string) => {
    setFormData((prev) => {
      const newFlavors = [...(prev.flavors || [])];
      const nextFlavor = { ...newFlavors[index], [field]: value };

      if (field === 'name') {
        const currentColor = newFlavors[index]?.color;
        const shouldAutoColor = !isHexColor(currentColor) || currentColor.toUpperCase() === DEFAULT_FLAVOR_COLOR;
        newFlavors[index] = {
          ...nextFlavor,
          color: shouldAutoColor ? getFlavorColor(nextFlavor) : currentColor,
        };
      } else {
        newFlavors[index] = { ...nextFlavor, color: getFlavorColor(nextFlavor) };
      }

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev: any) => {
      const newSizes = [...(prev.sizes || [])];
      if (field === 'servings' || field === 'price' || field === 'originalPrice') {
        const normalizedValue = value.replace(',', '.');
        newSizes[index] = {
          ...newSizes[index],
          [field]: value === '' ? '' : Number(normalizedValue),
        };
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const effectiveFormData = {
      ...formData,
      brand: isAddingBrand && newBrand.trim() ? newBrand.trim() : formData.brand,
    };

    const hasCategory = categories.length > 0 ? Boolean(effectiveFormData.categoryId) : Boolean(effectiveFormData.category?.trim());
    const hasRequiredTextFields = Boolean(
      hasCategory
        && effectiveFormData.brand?.trim()
        && effectiveFormData.subType?.trim()
        && effectiveFormData.name?.trim()
        && effectiveFormData.description?.trim()
        && effectiveFormData.image?.trim()
        && effectiveFormData.features?.some((feature) => feature.trim())
        && effectiveFormData.ingredients?.trim()
        && effectiveFormData.usage?.trim(),
    );

    if (!hasRequiredTextFields) {
      e.currentTarget.reportValidity();
      return;
    }

    const stockCount = effectiveFormData.stockCount as unknown;
    if (isMissingNumber(stockCount) || Number(stockCount) < 0) {
      e.currentTarget.querySelector<HTMLInputElement>('[name="stockCount"]')?.focus();
      return;
    }

    const sizes = (effectiveFormData.sizes || []).map((size) => ({
      ...size,
      label: size.label.trim(),
      servings: Number(size.servings),
      price: Number(size.price) || 0,
      originalPrice: isMissingNumber(size.originalPrice) ? undefined : Number(size.originalPrice),
    }));
    const invalidSize = sizes.find(
      (size) => !size.label || !Number.isFinite(size.servings) || size.servings <= 0,
    );

    if (invalidSize) {
      return;
    }

    const flavors = (formData.flavors || []).map((flavor) => normalizeFlavor({
      ...flavor,
      name: flavor.name.trim(),
    }));
    const invalidFlavor = flavors.find((flavor) => !flavor.name);

    if (invalidFlavor) {
      return;
    }

    const nutritionFacts = (effectiveFormData.nutritionFacts || []).map((fact) => ({
      label: fact.label.trim(),
      perServing: fact.perServing.trim(),
      per100g: fact.per100g?.trim() || undefined,
    }));
    const invalidNutrition = nutritionFacts.find((fact) => !fact.label || !fact.perServing || !fact.per100g);

    if (invalidNutrition) {
      return;
    }

    const sanitizedProduct = {
      ...effectiveFormData,
      stockCount: Number(stockCount),
      features: (effectiveFormData.features || []).map((feature) => feature.trim()).filter(Boolean),
      flavors,
      sizes,
      nutritionFacts,
      ingredients: effectiveFormData.ingredients?.trim() || '',
      usage: effectiveFormData.usage?.trim() || '',
    };

    onSave(sanitizedProduct as Product);
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

            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">Kategori</label>

              {categories.length > 0 ? (
                <select
                  required
                  name="categoryId"
                  value={formData.categoryId ?? ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Kategori seç</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  required
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Örn: Protein"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1.5 flex min-h-[28px] items-center justify-between gap-2">
                  <label className="block text-sm font-bold text-slate-700">Marka</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingBrand(true)}
                    disabled={!isCategorySelected}
                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 disabled:cursor-not-allowed disabled:text-slate-300"
                    aria-label="Yeni marka ekle"
                    title="Yeni marka ekle"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {isAddingBrand ? (
                  <div className="flex gap-2">
                    <input
                      required
                      autoFocus
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveCustomBrand();
                        }
                        if (e.key === 'Escape') {
                          setNewBrand('');
                          setIsAddingBrand(false);
                        }
                      }}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="Yeni marka"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomBrand}
                      className="rounded-xl border border-slate-200 p-2.5 text-emerald-600 transition-colors hover:bg-emerald-50"
                      aria-label="Markayı ekle"
                      title="Markayı ekle"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewBrand('');
                        setIsAddingBrand(false);
                      }}
                      className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition-colors hover:bg-slate-50"
                      aria-label="Vazgeç"
                      title="Vazgeç"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : isCustomBrand ? (
                  <input
                    required
                    name="brand"
                    value={formData.brand || ''}
                    onChange={handleChange}
                    disabled={!isCategorySelected}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 disabled:bg-slate-50 disabled:text-slate-400"
                    placeholder={isCategorySelected ? 'Örn: Optimum Nutrition' : 'Önce kategori seç'}
                  />
                ) : availableBrandOptions.length > 0 ? (
                  <select
                    required
                    name="brand"
                    value={currentBrand ?? ''}
                    onChange={handleChange}
                    disabled={!isCategorySelected}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">{isCategorySelected ? 'Marka seç' : 'Önce kategori seç'}</option>
                    {availableBrandOptions.map((brand, index) => (
                      <option key={`${brand}-${index}`} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    name="brand"
                    value={formData.brand || ''}
                    onChange={handleChange}
                    disabled={!isCategorySelected}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-colors disabled:bg-slate-50 disabled:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder={isCategorySelected ? 'Örn: Optimum Nutrition' : 'Önce kategori seç'}
                  />
                )}
              </div>
              <div>
                <div className="mb-1.5 flex min-h-[28px] items-center justify-between gap-2">
                  <label className="block text-sm font-bold text-slate-700">Alt Kategori</label>
                </div>
                <select
                  required
                  name="subType"
                  value={currentSubType ?? ''}
                  onChange={handleChange}
                  disabled={!isCategorySelected || filteredSubCategories.length === 0}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {!isCategorySelected
                      ? 'Önce kategori seç'
                      : filteredSubCategories.length === 0
                        ? 'Bu kategori için alt kategori bulunamadı'
                        : 'Alt kategori seç'}
                  </option>
                  {filteredSubCategories.map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
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

            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-700">Stok Sayısı</label>
              <input
                required
                type="number"
                name="stockCount"
                min="0"
                value={formData.stockCount ?? ''}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
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
                    {formData.flavors?.map((flavor, index) => {
                      const flavorColor = getFlavorColor(flavor);
                      const hasPresetColor = FLAVOR_COLOR_OPTIONS.some((color) => color.toUpperCase() === flavorColor);

                      return (
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
                              {FLAVOR_COLOR_OPTIONS.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => handleFlavorChange(index, 'color', color)}
                                  className={`h-6 w-6 rounded-full border border-black/10 shadow-sm transition-transform hover:scale-110 ${
                                    flavorColor === color.toUpperCase()
                                      ? 'ring-2 ring-indigo-500 ring-offset-2'
                                      : ''
                                  }`}
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                              <div
                                className={`relative ml-1 h-6 w-6 cursor-pointer overflow-hidden rounded-full border border-slate-300 shadow-inner transition-transform hover:scale-110 ${
                                  hasPresetColor ? '' : 'ring-2 ring-indigo-500 ring-offset-2'
                                }`}
                                style={{
                                  background: hasPresetColor
                                    ? 'conic-gradient(red,yellow,green,cyan,blue,magenta,red)'
                                    : flavorColor,
                                }}
                              >
                                <input
                                  type="color"
                                  value={flavorColor}
                                  onChange={(e) => handleFlavorChange(index, 'color', e.target.value)}
                                  className="absolute -inset-4 h-14 w-14 cursor-pointer opacity-0"
                                  title="Özel Renk Seç"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Boyutlar */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">Boyutlar</label>
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
                          min="1"
                          placeholder="Servis (Örn: 16)"
                          value={size.servings === 0 ? '' : (size.servings ?? '')}
                          onChange={(e) => handleSizeChange(index, 'servings', e.target.value)}
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
                    required
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
                          required
                          placeholder="100g Başı (Örn: 400 kcal)"
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
            disabled={isSaving}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Kaydediliyor...' : initialData ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
