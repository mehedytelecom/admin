import React, { useState, useEffect, useMemo } from 'react';
import { Palette, Plus, Check, ChevronDown, X, Sparkles } from 'lucide-react';

export const getColorHex = (colorName: string): string => {
  const lower = (colorName || '').toLowerCase().trim();
  if (lower.includes('midnight') || lower.includes('phantom black') || lower.includes('space black')) return '#0f172a';
  if (lower.includes('black') || lower.includes('dark')) return '#1e293b';
  if (lower.includes('white') || lower.includes('starlight')) return '#ffffff';
  if (lower.includes('silver')) return '#cbd5e1';
  if (lower.includes('gold') || lower.includes('desert')) return '#d4af37';
  if (lower.includes('rose gold') || lower.includes('pink')) return '#f472b6';
  if (lower.includes('purple') || lower.includes('violet') || lower.includes('lavender')) return '#a855f7';
  if (lower.includes('deep purple')) return '#581c87';
  if (lower.includes('navy') || lower.includes('dark blue')) return '#1e3a8a';
  if (lower.includes('sky blue') || lower.includes('cyan')) return '#38bdf8';
  if (lower.includes('blue')) return '#2563eb';
  if (lower.includes('mint') || lower.includes('light green')) return '#86efac';
  if (lower.includes('green') || lower.includes('emerald') || lower.includes('olive')) return '#16a34a';
  if (lower.includes('titanium') || lower.includes('grey') || lower.includes('gray') || lower.includes('graphite')) return '#64748b';
  if (lower.includes('red') || lower.includes('crimson')) return '#dc2626';
  if (lower.includes('orange') || lower.includes('coral')) return '#ea580c';
  if (lower.includes('yellow')) return '#ca8a04';
  if (lower.includes('bronze')) return '#b45309';
  return '#94a3b8';
};

export const DEFAULT_POPULAR_COLORS = [
  'Black',
  'White',
  'Blue',
  'Midnight',
  'Starlight',
  'Silver',
  'Gold',
  'Green',
  'Purple',
  'Grey',
  'Red',
  'Rose Gold',
  'Natural Titanium',
  'Titanium Black',
  'Desert Titanium',
  'Deep Purple',
  'Sky Blue'
];

interface ColorSelectorProps {
  value: string;
  onChange: (color: string) => void;
  availableColors: string[];
  onAddNewColor?: (newColor: string) => void;
  placeholder?: string;
  label?: string;
  compact?: boolean;
  onEnterPress?: () => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  value,
  onChange,
  availableColors,
  onAddNewColor,
  placeholder = 'Select or type color...',
  label,
  compact = false,
  onEnterPress
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');

  // Synchronize custom mode if value is not in available colors
  useEffect(() => {
    if (value && !availableColors.some(c => c.toLowerCase() === value.toLowerCase())) {
      setCustomInput(value);
    }
  }, [value, availableColors]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === '__custom__') {
      setIsCustomMode(true);
      setCustomInput(value || '');
    } else {
      setIsCustomMode(false);
      onChange(selected);
    }
  };

  const handleApplyCustomColor = () => {
    const trimmed = customInput.trim();
    if (trimmed) {
      onChange(trimmed);
      if (onAddNewColor) {
        onAddNewColor(trimmed);
      }
      setIsCustomMode(false);
    }
  };

  // Popular quick chips (first 8 from available, prioritizing defaults)
  const quickChips = useMemo(() => {
    const chips: string[] = [];
    // Prioritize popular ones that exist in availableColors or defaults
    const combined = Array.from(new Set([...DEFAULT_POPULAR_COLORS.slice(0, 8), ...availableColors]));
    combined.forEach(c => {
      if (c && !chips.includes(c) && chips.length < 10) {
        chips.push(c);
      }
    });
    return chips;
  }, [availableColors]);

  const hexColor = getColorHex(value);
  const isLight = hexColor === '#ffffff' || hexColor === '#f8fafc' || hexColor === '#cbd5e1';

  if (compact) {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            {label}
          </label>
        )}
        {!isCustomMode ? (
          <div className="flex gap-1.5 items-center">
            <div className="relative flex-1">
              <select
                value={value || ''}
                onChange={handleSelectChange}
                className="w-full pl-7 pr-7 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium appearance-none cursor-pointer"
              >
                <option value="">{placeholder}</option>
                {availableColors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__custom__">➕ + Custom Color...</option>
              </select>
              {/* Color dot */}
              <div 
                className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full pointer-events-none shadow-2xs ${isLight ? 'border border-gray-300' : ''}`}
                style={{ backgroundColor: value ? hexColor : '#e2e8f0' }}
              />
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCustomMode(true);
                setCustomInput(value || '');
              }}
              className="px-2 py-2 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors shrink-0"
              title="Type custom color name"
            >
              + Custom
            </button>
          </div>
        ) : (
          <div className="flex gap-1.5 items-center">
            <input
              type="text"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder="e.g. Deep Blue"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyCustomColor();
                  if (onEnterPress) onEnterPress();
                } else if (e.key === 'Escape') {
                  setIsCustomMode(false);
                }
              }}
              className="flex-1 px-2.5 py-2 rounded-lg border border-blue-400 bg-blue-50/40 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-medium"
            />
            <button
              type="button"
              onClick={handleApplyCustomColor}
              className="px-2.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0"
              title="Apply this custom color"
            >
              Set
            </button>
            <button
              type="button"
              onClick={() => setIsCustomMode(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg shrink-0"
              title="Back to list"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label ? (
          <label className="block text-sm font-bold text-gray-700 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-blue-600" />
            <span>{label}</span>
          </label>
        ) : (
          <label className="block text-sm font-bold text-gray-700 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-blue-600" />
            <span>Color (রং)</span>
          </label>
        )}

        <button
          type="button"
          onClick={() => {
            setIsCustomMode(!isCustomMode);
            if (!isCustomMode) {
              setCustomInput(value || '');
            }
          }}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
        >
          {isCustomMode ? (
            <span>← Choose from List</span>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>+ Custom Color</span>
            </>
          )}
        </button>
      </div>

      {!isCustomMode ? (
        <div className="relative">
          <select
            value={value || ''}
            onChange={handleSelectChange}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium appearance-none cursor-pointer shadow-2xs"
          >
            <option value="">-- Select Color (রং নির্বাচন করুন) --</option>
            {availableColors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="__custom__">➕ + Add New / Custom Color (নতুন রং লিখুন)...</option>
          </select>

          {/* Color Preview Dot */}
          <div 
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-2xs pointer-events-none transition-all ${
              isLight ? 'border border-gray-300' : ''
            }`}
            style={{ backgroundColor: value ? hexColor : '#e2e8f0' }}
          />

          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-gray-400">
            {value && (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md hidden sm:inline">
                {value}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder="Type custom color name (e.g. Titanium Blue, Mint Green, etc.)..."
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyCustomColor();
                  if (onEnterPress) onEnterPress();
                } else if (e.key === 'Escape') {
                  setIsCustomMode(false);
                }
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-400 bg-blue-50/30 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
            />
            <div 
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-2xs pointer-events-none ${
                getColorHex(customInput) === '#ffffff' ? 'border border-gray-300' : ''
              }`}
              style={{ backgroundColor: getColorHex(customInput) }}
            />
          </div>

          <button
            type="button"
            onClick={handleApplyCustomColor}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Check className="w-4 h-4" />
            <span>Set Color</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCustomMode(false)}
            className="px-3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors shrink-0"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Color Chips for 1-click selection */}
      <div className="pt-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Quick Select (১-ক্লিক এ সিলেক্ট করুন):</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {quickChips.map((chip) => {
            const isSelected = (value || '').toLowerCase() === chip.toLowerCase();
            const chipHex = getColorHex(chip);
            const chipIsLight = chipHex === '#ffffff' || chipHex === '#f8fafc' || chipHex === '#cbd5e1';

            return (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  onChange(chip);
                  setIsCustomMode(false);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs ring-2 ring-blue-200 font-bold'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs ${
                    chipIsLight && !isSelected ? 'border border-gray-300' : ''
                  }`}
                  style={{ backgroundColor: chipHex }}
                />
                <span>{chip}</span>
                {isSelected && <Check className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setIsCustomMode(true);
              setCustomInput('');
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Custom...</span>
          </button>
        </div>
      </div>
    </div>
  );
};
