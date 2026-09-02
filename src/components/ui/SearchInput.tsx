import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search exercises...',
  className = '',
  ...props
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search className="absolute left-3.5 text-[#64748B] w-4 h-4 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white/85 border border-[#CBD5E1] rounded-xl pl-10 pr-9 py-3 text-[#0F172A] placeholder-[#94A3B8] text-sm focus:outline-none focus:border-[#008B8E] transition-colors shadow-sm"
        {...props}
      />
      {value && String(value).length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
