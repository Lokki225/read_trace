'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSeriesStore } from '@/store/seriesStore';
import { Search, X } from 'lucide-react';

export function SearchBar() {
  const [inputValue, setInputValue] = useState('');
  const { searchQuery, setSearchQuery } = useSeriesStore();

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const debounceTimer = useCallback(() => {
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, setSearchQuery]);

  useEffect(() => {
    const cleanup = debounceTimer();
    return cleanup;
  }, [debounceTimer]);

  const handleClear = () => {
    setInputValue('');
    setSearchQuery('');
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search series by title, genre, or platform..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
          aria-label="Search series"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
