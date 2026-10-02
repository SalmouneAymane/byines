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
            { code: 'en', label: 'EN' },
            { code: 'fr', label: 'FR' },
            { code: 'ar', label: 'العربية' }
        ];

        container.innerHTML = `
            <div class="flex items-center space-x-1 sm:space-x-2 text-[11px] font-semibold">
                ${langs.map(l => {
                    const active = this.currentLang === l.code;
                    return `
                        <button 
                            type="button" 
                            data-set-lang="${l.code}" 
                            class="px-2 py-1 transition-colors ${active ? 'bg-[#2C2926] text-white' : 'text-[#7A7672] hover:text-[#2C2926]'}"
                        >
                            ${l.label}
                        </button>
                    `;
                }).join('')}
            </div>
        `;

        this.attachSelectorEvents();
    },

    attachSelectorEvents() {
        document.querySelectorAll('[data-set-lang]').forEach(btn => {
            btn.onclick = () => {
                const lang = btn.getAttribute('data-set-lang');
                this.setLanguage(lang);
            };
        });
    }
};

window.i18n = i18n;
