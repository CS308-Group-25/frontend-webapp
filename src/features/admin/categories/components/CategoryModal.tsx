/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react';
import { X, Tag, FileText, AlertCircle } from 'lucide-react';
import type { Category, CategoryFormData } from '../types/category.types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => void;
  initialData?: Category;
  existingNames: string[];
}

const emptyForm: CategoryFormData = {
  name: '',
  description: '',
};

const NAME_MAX = 50;
const DESC_MAX = 200;

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingNames,
}: CategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>(emptyForm);
  const [nameError, setNameError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(
        initialData
          ? { name: initialData.name, description: initialData.description }
          : emptyForm,
      );
      setNameError('');
      setTouched({});
      // Auto-focus name field after mount
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Enforce max lengths
    if (name === 'name' && value.length > NAME_MAX) return;
    if (name === 'description' && value.length > DESC_MAX) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'name') setNameError('');
  };

  const validateName = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return 'Kategori adı zorunludur.';

    const isDuplicate = existingNames
      .filter((n) => (initialData ? n !== initialData.name : true))
      .some((n) => n.toLowerCase() === trimmed.toLowerCase());

    if (isDuplicate) return 'Bu isimde bir kategori zaten mevcut.';
    return '';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (name === 'name') {
      setNameError(validateName(formData.name));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateName(formData.name);
    if (error) {
      setNameError(error);
      setTouched((prev) => ({ ...prev, name: true }));
      nameInputRef.current?.focus();
      return;
    }
    onSave({ ...formData, name: formData.name.trim() });
  };

  const isEditing = Boolean(initialData);
  const nameCharsLeft = NAME_MAX - formData.name.length;
  const descCharsLeft = DESC_MAX - (formData.description?.length ?? 0);
  const hasNameError = touched.name && !!nameError;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/60">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
              <Tag className="h-4 w-4 text-indigo-600" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {isEditing ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-6">
          <form id="category-form" onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {/* Name */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="cat-name" className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                  Kategori Adı
                  <span className="text-red-500">*</span>
                </label>
                <span className={`text-xs font-medium tabular-nums ${nameCharsLeft < 10 ? 'text-amber-500' : 'text-slate-400'}`}>
                  {nameCharsLeft} kalan
                </span>
              </div>
              <input
                ref={nameInputRef}
                id="cat-name"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Örn: Protein"
                autoComplete="off"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all duration-150 focus:ring-2 ${
                  hasNameError
                    ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-red-200'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
                }`}
              />
              {hasNameError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-500">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {nameError}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="cat-desc" className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  Açıklama
                  <span className="text-xs font-normal text-slate-400 ml-1">(isteğe bağlı)</span>
                </label>
                <span className={`text-xs font-medium tabular-nums ${descCharsLeft < 30 ? 'text-amber-500' : 'text-slate-400'}`}>
                  {descCharsLeft} kalan
                </span>
              </div>
              <textarea
                id="cat-desc"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                placeholder="Kategori hakkında kısa bir açıklama…"
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition-all duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Info note for edit mode */}
            {isEditing && (
              <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                ✏️ &quot;{initialData?.name}&quot; kategorisini düzenliyorsunuz. Değişiklikler kaydedildikten sonra ürünler etkilenebilir.
              </p>
            )}
          </form>
        </div>

        {/* Footer */}
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
            form="category-form"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEditing ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
