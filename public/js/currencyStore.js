/**
 * ByInes Multi-Currency Display Engine
 * Phase 16 — Hardcoded conversion rates (MAD base currency).
 * All DB prices are stored in MAD. Conversion + formatting is purely client-side.
 */

const CURRENCIES = {
    MAD: { code: 'MAD', symbol: 'DH',  rate: 1,      locale: 'fr-MA', label: 'MAD' },
    EUR: { code: 'EUR', symbol: '€',   rate: 0.092,   locale: 'fr-FR', label: 'EUR' },
    USD: { code: 'USD', symbol: '$',    rate: 0.098,   locale: 'en-US', label: 'USD' },
};

export const currencyStore = {
    STORAGE_KEY: 'byines_currency',
    current: 'MAD',

    /** Initialise from localStorage, render selector, bind events */
    init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved && CURRENCIES[saved]) {
            this.current = saved;
        }
        this.renderSelector();
        this.attachSelectorEvents();
    },

    /** Change active currency, persist, re-render everything */
    setCurrency(code) {
        if (!CURRENCIES[code]) return;
        this.current = code;
        localStorage.setItem(this.STORAGE_KEY, code);
        this.renderSelector();
        this.attachSelectorEvents();

        // Broadcast to re-render views (same pattern as language-changed)
        window.dispatchEvent(new CustomEvent('currency-changed', { detail: { currency: code } }));
    },

    /**
     * Convert a MAD price to the active currency and return a formatted string.
     * @param {number|string} madPrice — price in MAD (from DB)
     * @returns {string} e.g. "120.00 DH", "€11.04", "$11.76"
     */
    formatPrice(madPrice) {
        const amount = parseFloat(madPrice) || 0;
        const cur = CURRENCIES[this.current] || CURRENCIES.MAD;
        const converted = amount * cur.rate;

        if (cur.code === 'MAD') {
            return `${converted.toFixed(2)} DH`;
        }
        return `${cur.symbol}${converted.toFixed(2)}`;
    },

    /**
     * Convert a MAD value (number) to the active currency (number only, no formatting).
     * Useful for threshold comparisons (free shipping, etc.).
     */
    convert(madAmount) {
        const cur = CURRENCIES[this.current] || CURRENCIES.MAD;
        return (parseFloat(madAmount) || 0) * cur.rate;
    },

    /** Get the active currency symbol */
    getSymbol() {
        return (CURRENCIES[this.current] || CURRENCIES.MAD).symbol;
    },

    /** Render the MAD | EUR | USD toggle into #header-currency-selector */
    renderSelector() {
        const container = document.getElementById('header-currency-selector');
        if (!container) return;

        const codes = Object.keys(CURRENCIES);
        const activeCur = CURRENCIES[this.current] || CURRENCIES.MAD;

        container.innerHTML = `
            <div class="relative inline-block text-left" id="currency-dropdown-wrapper">
                <button 
                    type="button" 
                    id="currency-dropdown-btn" 
                    aria-haspopup="true" 
                    aria-expanded="false"
                    class="group flex items-center space-x-1 py-1 px-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2C2926] hover:text-stone-500 transition-colors focus:outline-none"
                >
                    <span>${activeCur.label}</span>
                    <svg id="currency-dropdown-chevron" class="w-3 h-3 text-[#7A7672] group-hover:text-[#2C2926] transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>

                <!-- Floating Luxury Menu -->
                <div 
                    id="currency-dropdown-menu" 
                    class="hidden absolute right-0 sm:right-auto sm:left-0 top-full mt-2 w-36 bg-white border border-[#E5E2DC] shadow-[0_8px_24px_rgba(0,0,0,0.08)] py-1 z-50 rounded-none transform transition-all duration-150"
                >
                    <div class="py-1">
                        ${codes.map(code => {
                            const cur = CURRENCIES[code];
                            const isSelected = code === this.current;
                            return `
                                <button 
                                    type="button"
                                    data-set-currency="${code}" 
                                    class="w-full flex items-center justify-between px-3.5 py-2 text-[11px] text-left transition-colors ${
                                        isSelected 
                                            ? 'bg-[#F7F5F0] text-[#1A1817] font-bold' 
                                            : 'text-[#5D5F5F] hover:bg-[#FAF9F6] hover:text-[#1A1817]'
                                    }"
                                >
                                    <span class="tracking-wider uppercase font-semibold">${cur.label}</span>
                                    <span class="text-[10px] text-[#7A7672] font-normal ml-2">${cur.symbol}</span>
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        this.attachSelectorEvents();
    },

    /** Bind change event on currency select dropdown */
    attachSelectorEvents() {
        const wrapper = document.getElementById('currency-dropdown-wrapper');
        const btn = document.getElementById('currency-dropdown-btn');
        const menu = document.getElementById('currency-dropdown-menu');
        const chevron = document.getElementById('currency-dropdown-chevron');

        if (!btn || !menu) return;

        const toggleMenu = (open) => {
            const isCurrentlyOpen = !menu.classList.contains('hidden');
            const shouldOpen = open !== undefined ? open : !isCurrentlyOpen;

            if (shouldOpen) {
                // Close language dropdown if open
                window.dispatchEvent(new CustomEvent('close-dropdowns', { detail: { except: 'currency' } }));
                menu.classList.remove('hidden');
                btn.setAttribute('aria-expanded', 'true');
                if (chevron) chevron.classList.add('rotate-180');
            } else {
                menu.classList.add('hidden');
                btn.setAttribute('aria-expanded', 'false');
                if (chevron) chevron.classList.remove('rotate-180');
            }
        };

        btn.onclick = (e) => {
            e.stopPropagation();
            toggleMenu();
        };

        // Option items click
        menu.querySelectorAll('[data-set-currency]').forEach(optionBtn => {
            optionBtn.onclick = (e) => {
                e.stopPropagation();
                const code = optionBtn.getAttribute('data-set-currency');
                toggleMenu(false);
                this.setCurrency(code);
            };
        });

        // Close on global click outside
        const handleOutsideClick = (e) => {
            if (wrapper && !wrapper.contains(e.target)) {
                toggleMenu(false);
            }
        };

        document.addEventListener('click', handleOutsideClick);

        // Listen for close-dropdowns broadcast
        window.addEventListener('close-dropdowns', (e) => {
            if (e.detail?.except !== 'currency') {
                toggleMenu(false);
            }
        });
    }
};

// Expose globally for convenience
window.currencyStore = currencyStore;
