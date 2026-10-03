import en from './i18n/en.js';
import fr from './i18n/fr.js';
import ar from './i18n/ar.js';

const dictionaries = { en, fr, ar };

export const i18n = {
    STORAGE_KEY: 'byines_lang',
    currentLang: 'en',

    init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved && dictionaries[saved]) {
            this.currentLang = saved;
        } else {
            this.currentLang = 'en';
        }

        this.applyDirection();
        this.renderLanguageSelector();
        this.attachSelectorEvents();
    },

    setLanguage(lang) {
        if (!dictionaries[lang]) return;

        this.currentLang = lang;
        localStorage.setItem(this.STORAGE_KEY, lang);
        this.applyDirection();

        // Update selector active state in header
        this.renderLanguageSelector();

        // Broadcast event to re-render dynamic views
        window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang } }));
    },

    applyDirection() {
        const isRtl = this.currentLang === 'ar';
        document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', this.currentLang);
    },

    t(key, params = {}) {
        const keys = key.split('.');
        let dict = dictionaries[this.currentLang] || dictionaries['en'];
        let result = dict;

        for (const k of keys) {
            if (result && result[k] !== undefined) {
                result = result[k];
            } else {
                // Fallback to English dictionary if key is missing
                let fallback = dictionaries['en'];
                for (const fk of keys) {
                    fallback = fallback ? fallback[fk] : null;
                }
                result = fallback || key;
                break;
            }
        }

        if (typeof result !== 'string') {
            return key;
        }

        // Replace template parameters e.g. {count}, {amount}
        let formatted = result;
        Object.keys(params).forEach(p => {
            formatted = formatted.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
        });

        return formatted;
    },

    renderLanguageSelector() {
        const container = document.getElementById('header-lang-selector');
        if (!container) return;

        const langs = [
            { code: 'en', label: 'EN', full: 'English' },
            { code: 'fr', label: 'FR', full: 'Français' },
            { code: 'ar', label: 'AR', full: 'العربية' }
        ];

        const activeLang = langs.find(l => l.code === this.currentLang) || langs[0];

        container.innerHTML = `
            <div class="relative inline-block text-left" id="lang-dropdown-wrapper">
                <button 
                    type="button" 
                    id="lang-dropdown-btn" 
                    aria-haspopup="true" 
                    aria-expanded="false"
                    class="group flex items-center space-x-1 py-1 px-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2C2926] hover:text-stone-500 transition-colors focus:outline-none"
                >
                    <span>${activeLang.label}</span>
                    <svg id="lang-dropdown-chevron" class="w-3 h-3 text-[#7A7672] group-hover:text-[#2C2926] transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>

                <!-- Floating Luxury Menu -->
                <div 
                    id="lang-dropdown-menu" 
                    class="hidden absolute right-0 sm:right-auto sm:left-0 top-full mt-2 w-36 bg-white border border-[#E5E2DC] shadow-[0_8px_24px_rgba(0,0,0,0.08)] py-1 z-50 rounded-none transform transition-all duration-150"
                >
                    <div class="py-1">
                        ${langs.map(l => {
                            const isSelected = l.code === this.currentLang;
                            return `
                                <button 
                                    type="button"
                                    data-set-lang="${l.code}" 
                                    class="w-full flex items-center justify-between px-3.5 py-2 text-[11px] text-left transition-colors ${
                                        isSelected 
                                            ? 'bg-[#F7F5F0] text-[#1A1817] font-bold' 
                                            : 'text-[#5D5F5F] hover:bg-[#FAF9F6] hover:text-[#1A1817]'
                                    }"
                                >
                                    <span class="tracking-wider uppercase font-semibold">${l.label}</span>
                                    <span class="text-[10px] text-[#7A7672] font-normal ml-2">${l.full}</span>
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        this.attachSelectorEvents();
    },

    attachSelectorEvents() {
        const wrapper = document.getElementById('lang-dropdown-wrapper');
        const btn = document.getElementById('lang-dropdown-btn');
        const menu = document.getElementById('lang-dropdown-menu');
        const chevron = document.getElementById('lang-dropdown-chevron');

        if (!btn || !menu) return;

        const toggleMenu = (open) => {
            const isCurrentlyOpen = !menu.classList.contains('hidden');
            const shouldOpen = open !== undefined ? open : !isCurrentlyOpen;

            if (shouldOpen) {
                // Close currency dropdown if open
                window.dispatchEvent(new CustomEvent('close-dropdowns', { detail: { except: 'lang' } }));
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
        menu.querySelectorAll('[data-set-lang]').forEach(optionBtn => {
            optionBtn.onclick = (e) => {
                e.stopPropagation();
                const lang = optionBtn.getAttribute('data-set-lang');
                toggleMenu(false);
                this.setLanguage(lang);
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
            if (e.detail?.except !== 'lang') {
                toggleMenu(false);
            }
        });
    }
};

window.i18n = i18n;
