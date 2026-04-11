'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { CheckoutStep } from '../types';

interface StepIndicatorProps {
  currentStep: CheckoutStep;
}

const steps = [
  { number: 1 as CheckoutStep, label: 'Adres' },
  { number: 2 as CheckoutStep, label: 'Kargo' },
  { number: 3 as CheckoutStep, label: 'Ödeme' },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;

        return (
          <React.Fragment key={step.number}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-indigo-700 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </div>
              <span
                className={`text-sm font-semibold ${
                  isActive ? 'text-indigo-700' : isCompleted ? 'text-green-600' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-3 transition-colors ${
                  step.number < currentStep ? 'bg-green-300' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
