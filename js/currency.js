/* Packify — currency converter.
   Pack prices are stored in INR (see js/data.js). This module converts to the
   customer's selected display currency using a static rate table.
   Rates are approximate — update RATES_PER_INR to refresh.
   Selection persists in localStorage. */

const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'PKR', name: 'Pakistani Rupee' }
];

/* Units of each currency per 1 INR (approximate, update as needed) */
const RATES_PER_INR = {
  INR: 1,
  USD: 0.012,
  EUR: 0.0105,
  GBP: 0.009,
  AUD: 0.0185,
  CAD: 0.0168,
  SGD: 0.0161,
  AED: 0.0441,
  PKR: 3.3
};

const STORAGE_KEY = 'packify_currency';
const CHANGE_EVENT = 'packify:currency';

function getCurrency() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return CURRENCIES.find(c => c.code === saved) || CURRENCIES[0];
}

function setCurrency(code) {
  if (!CURRENCIES.some(c => c.code === code)) return;
  localStorage.setItem(STORAGE_KEY, code);
  document.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { code } }));
}

/** Convert an INR amount to the given (or currently selected) currency. */
function convertINR(amountINR, code) {
  const target = code || getCurrency().code;
  const rate = RATES_PER_INR[target] ?? 1;
  return amountINR * rate;
}

const formatters = {};
function formatterFor(code) {
  if (!formatters[code]) {
    try {
      formatters[code] = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } catch {
      formatters[code] = null;
    }
  }
  return formatters[code];
}

/** Format an INR amount in the selected display currency. */
function formatINR(amountINR) {
  const cur = getCurrency();
  const amount = convertINR(amountINR, cur.code);
  const fmt = formatterFor(cur.code);
  if (fmt) return fmt.format(amount);
  return `${cur.code} ${amount.toFixed(2)}`;
}
