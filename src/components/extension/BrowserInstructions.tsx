'use client';

type BrowserType = 'chrome' | 'firefox' | 'safari';

interface BrowserInstructionsProps {
  browser: BrowserType;
  onVerify: () => void;
}

const STORE_LINKS: Record<BrowserType, string> = {
  chrome: 'https://chrome.google.com/webstore/detail/readtrace/[extension-id]',
  firefox: 'https://addons.mozilla.org/firefox/addon/readtrace/',
  safari: 'https://apps.apple.com/app/readtrace/[app-id]',
};

const STORE_NAMES: Record<BrowserType, string> = {
  chrome: 'Chrome Web Store',
  firefox: 'Firefox Add-ons',
  safari: 'Safari App Store',
};

const INSTRUCTIONS: Record<BrowserType, string[]> = {
  chrome: [
    'Click the "Add to Chrome" button in the Chrome Web Store',
    'Click "Add extension" in the confirmation popup',
    'The ReadTrace icon will appear in your browser toolbar',
    'Click the icon to confirm it is active',
  ],
  firefox: [
    'Click the "Add to Firefox" button in Firefox Add-ons',
    'Click "Add" in the permissions dialog',
    'The ReadTrace icon will appear in your browser toolbar',
    'Click the icon to confirm it is active',
  ],
  safari: [
    'Click "Get" in the Safari App Store listing',
    'Open Safari → Preferences → Extensions',
    'Enable the ReadTrace extension toggle',
    'Grant the requested permissions when prompted',
  ],
};

const TROUBLESHOOTING_ITEMS = [
  {
    problem: 'Extension not detected after installation',
    solution: 'Make sure you clicked "Add" or "Enable" in the browser dialog, then refresh this page.',
  },
  {
    problem: 'Extension icon not visible in toolbar',
    solution: 'Click the puzzle/extensions icon in your browser toolbar and pin ReadTrace.',
  },
  {
    problem: 'Permission dialog did not appear',
    solution: 'Try clicking the store link again and ensure pop-ups are not blocked.',
  },
];

export function BrowserInstructions({ browser, onVerify }: BrowserInstructionsProps) {
  const browserName = browser.charAt(0).toUpperCase() + browser.slice(1);

  return (
    <div
      className="browser-instructions mt-6"
      data-testid={`${browser}-instructions`}
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Installing on {browserName}
      </h2>

      <ol className="space-y-3 mb-6" aria-label={`${browserName} installation steps`}>
        {INSTRUCTIONS[browser].map((step, index) => (
          <li
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <span
              className="shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <span className="text-gray-700 dark:text-gray-300">{step}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <a
          href={STORE_LINKS[browser]}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`${browser}-store-link`}
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`Open ${STORE_NAMES[browser]} in a new tab`}
        >
          Open {STORE_NAMES[browser]}
        </a>

        <button
          onClick={onVerify}
          data-testid="verify-installation-btn"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Verify Installation
        </button>
      </div>

      <div className="troubleshooting mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <details>
          <summary
            className="cursor-pointer text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 select-none"
            data-testid="troubleshooting-toggle"
          >
            Having trouble? View troubleshooting tips
          </summary>
          <ul className="mt-3 space-y-3" aria-label="Troubleshooting tips">
            {TROUBLESHOOTING_ITEMS.map((item, index) => (
              <li key={index} className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <p className="font-medium text-yellow-800 dark:text-yellow-300 text-sm">
                  {item.problem}
                </p>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                  {item.solution}
                </p>
              </li>
            ))}
            <li className="text-sm text-gray-600 dark:text-gray-400">
              Still stuck?{' '}
              <a
                href="mailto:support@readtrace.app"
                className="text-blue-600 dark:text-blue-400 underline"
              >
                Contact support
              </a>
            </li>
          </ul>
        </details>
      </div>
    </div>
  );
}
