'use client';

import { useState } from 'react';
import { NUMBERS_REGISTRY } from '@/lib/config/numbers';
import { formatCHF, formatNumber } from '@/lib/utils/format';
import SourceModal from './SourceModal';

interface NumberWithSourceProps {
  numberKey: keyof typeof NUMBERS_REGISTRY;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

const SIZE_CLASSES = {
  sm: 'text-lg font-semibold',
  md: 'text-2xl font-bold',
  lg: 'text-4xl font-bold',
  xl: 'text-5xl font-bold',
};

/**
 * NumberWithSource - Clickable number that opens source modal
 *
 * Ground Truth #2: Single Source of Truth
 * - All numbers come from NUMBERS_REGISTRY
 * - Click to see source, methodology, confidence
 * - Download button if documentUrl exists
 *
 * Usage:
 *   <NumberWithSource numberKey="CO2_SAVED_PER_LAPTOP" size="xl" />
 */
export function NumberWithSource({
  numberKey,
  className = '',
  size = 'md',
  showLabel = true,
}: NumberWithSourceProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const data = NUMBERS_REGISTRY[numberKey];

  if (!data) {
    console.error(`NumberWithSource: Unknown key "${numberKey}"`);
    return null;
  }

  const formattedValue = typeof data.value === 'number' && data.category === 'financial'
    ? formatCHF(data.value)
    : typeof data.value === 'number'
      ? formatNumber(data.value)
      : String(data.value);

  return (
    <>
      {/* Clickable Number */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          group cursor-pointer text-left transition-all
          hover:scale-105 active:scale-95
          ${className}
        `}
        aria-label={`Quelle anzeigen für ${data.label}`}
      >
        <div className="relative">
          <div className={`${SIZE_CLASSES[size]} text-primary group-hover:text-primary-light`}>
            {formattedValue}
          </div>
          {showLabel && (
            <div className="text-sm text-text-light mt-1">
              {data.label}
            </div>
          )}
          {/* Underline indicator */}
          <div className="h-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
          {/* Info icon */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-primary">i</span>
          </div>
        </div>
      </button>

      {isModalOpen && (
        <SourceModal data={data} formattedValue={formattedValue} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

/**
 * NumberGrid - Display multiple numbers in a grid
 *
 * Usage:
 *   <NumberGrid numbers={['CO2_SAVED_PER_LAPTOP', 'LAPTOPS_REFURBISHED_TOTAL']} />
 */
interface NumberGridProps {
  numbers: Array<keyof typeof NUMBERS_REGISTRY>;
  columns?: 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function NumberGrid({ numbers, columns = 3, size = 'md' }: NumberGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {numbers.map((key) => (
        <div key={key} className="bg-white rounded-lg p-6 shadow-sm border border-border">
          <NumberWithSource numberKey={key} size={size} showLabel={true} />
        </div>
      ))}
    </div>
  );
}

/**
 * InlineNumber - Use in running text
 *
 * Usage:
 *   We save <InlineNumber numberKey="CO2_SAVED_PER_LAPTOP" /> per laptop.
 */
interface InlineNumberProps {
  numberKey: keyof typeof NUMBERS_REGISTRY;
}

export function InlineNumber({ numberKey }: InlineNumberProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const data = NUMBERS_REGISTRY[numberKey];

  if (!data) return null;

  const formattedValue = typeof data.value === 'number' && data.category === 'financial'
    ? formatCHF(data.value)
    : typeof data.value === 'number'
      ? formatNumber(data.value)
      : String(data.value);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="font-semibold text-primary hover:underline cursor-pointer"
        aria-label={`Quelle anzeigen für ${data.label}`}
      >
        {formattedValue}
      </button>

      {isModalOpen && (
        <SourceModal data={data} formattedValue={formattedValue} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
