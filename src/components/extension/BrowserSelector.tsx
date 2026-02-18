'use client';

type BrowserType = 'chrome' | 'firefox' | 'safari';

interface BrowserOption {
  id: BrowserType;
  name: string;
  logo: string;
  description: string;
}

interface BrowserSelectorProps {
  selected: BrowserType | null;
  onSelect: (browser: BrowserType) => void;
}

const BROWSERS: BrowserOption[] = [
  { id: 'chrome', name: 'Chrome', logo: '🌐', description: 'Google Chrome' },
  { id: 'firefox', name: 'Firefox', logo: '🦊', description: 'Mozilla Firefox' },
  { id: 'safari', name: 'Safari', logo: '🧭', description: 'Apple Safari' },
];

export function BrowserSelector({ selected, onSelect }: BrowserSelectorProps) {
  return (
    <div className="browser-selector">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Select Your Browser
      </h2>
      <div
        className="grid grid-cols-3 gap-4"
        role="radiogroup"
        aria-label="Select your browser"
      >
        {BROWSERS.map((browser) => (
          <button
            key={browser.id}
            data-testid={`browser-${browser.id}`}
            className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              selected === browser.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
            onClick={() => onSelect(browser.id)}
            role="radio"
            aria-checked={selected === browser.id}
            aria-label={`Select ${browser.name}`}
          >
            <span className="text-4xl mb-2" aria-hidden="true">
              {browser.logo}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {browser.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
