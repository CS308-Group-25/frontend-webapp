'use client';

import { useState } from 'react';
import { Tag } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { patchProductPrice } from '../api';

interface SetPriceButtonProps {
  productId: string;
  currentPrice: number;
  onSuccess: (newPrice: number) => void;
}

export default function SetPriceButton({ productId, currentPrice, onSuccess }: SetPriceButtonProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (price: number) => patchProductPrice(productId, price),
    onSuccess: (_, price) => {
      onSuccess(price);
      toast.success('Ürün fiyatı başarıyla güncellendi.');
      setIsEditing(false);
      setError(null);
    },
    onError: (err: string) => {
      setError(err);
    },
  });

  const handleOpen = () => {
    setInputValue(String(currentPrice));
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleConfirm = () => {
    const price = parseFloat(inputValue);
    if (isNaN(price) || price < 0) {
      setError('Geçerli bir fiyat giriniz.');
      return;
    }
    mutate(price);
  };

  if (!isEditing) {
    return (
      <button
        onClick={handleOpen}
        className="rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-50 active:scale-95"
        title="Fiyat Belirle"
      >
        <Tag className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          step="0.01"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          autoFocus
        />
        <button
          onClick={handleConfirm}
          disabled={isPending}
          className="rounded-lg px-2 py-1 text-xs font-bold text-white bg-indigo-600 transition-colors hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
        >
          {isPending ? '...' : 'Onayla'}
        </button>
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="rounded-lg px-2 py-1 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 active:scale-95 disabled:opacity-50"
        >
          İptal
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
