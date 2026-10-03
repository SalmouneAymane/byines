/**
 * ByInes Storefront — Reusable Header Component
 * Can be dynamically rendered or embedded in any HTML page/template.
 */
export const HeaderComponent = {
    render() {
        return `
            <header class="bg-white border-b border-[#E5E2DC] sticky top-0 z-40">
                <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <!-- Left: Brand Logo -->
                    <a href="#home" aria-label="Byines Homepage" class="flex items-center">
                        <img src="/public/assets/logo/logo.svg" alt="Byines" class="h-9 md:h-11 w-auto object-contain transition-opacity hover:opacity-75" />
                    </a>

                    <!-- Center: Navigation Links -->
                    <nav class="hidden md:flex items-center space-x-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2C2926]">
                        <a href="#shop" data-nav-link="shop" class="hover:opacity-60 transition-opacity">NEW ARRIVALS</a>
                        <a href="#collections" data-nav-link="collections" class="hover:opacity-60 transition-opacity">COLLECTIONS</a>
                        <a href="#about" data-nav-link="about" class="hover:opacity-60 transition-opacity">ABOUT</a>
                    </nav>

                    <!-- Right: Action Icons, Language & Currency Selectors -->
                    <div class="flex items-center space-x-2 sm:space-x-4 text-[#2C2926]">
                        <!-- Language Selector Dropdown -->
                        <div id="header-lang-selector" class="pr-1 sm:pr-2 border-r border-[#E5E2DC]"></div>
                        <!-- Currency Selector Dropdown -->
                        <div id="header-currency-selector" class="pr-1 sm:pr-2 border-r border-[#E5E2DC]"></div>

                        <!-- Search Icon Button -->
                        <button id="btn-toggle-search" aria-label="Search catalog" class="p-1 hover:opacity-60 transition-opacity">
                            <svg class="w-5 h-5 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </button>

                        <!-- Shopping Bag Icon with Badge -->
                        <button id="btn-open-cart" aria-label="Cart" class="p-1 hover:opacity-60 transition-opacity relative">
                            <svg class="w-5 h-5 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                            <span class="cart-badge-count absolute -top-1.5 -right-2 w-4 h-4 bg-[#1A1817] text-white text-[9px] font-bold rounded-full flex items-center justify-center">0</span>
                        </button>

                        <!-- User Profile / Admin Link -->
                        <a href="/public/admin/index.html" aria-label="Admin Panel" class="p-1 hover:opacity-60 transition-opacity">
                            <svg class="w-5 h-5 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        </a>
                    </div>
                </div>

                <!-- Hidden Quick Search Bar -->
                <div id="quick-search-bar" class="hidden border-t border-[#E5E2DC] bg-[#F7F5F0] py-3 px-6">
                    <div class="max-w-xl mx-auto flex items-center space-x-3">
                        <input type="text" id="global-search-input" placeholder="Search abayas, scarfs, or collections..." class="flex-1 px-4 py-2 bg-white border border-[#E5E2DC] text-xs font-sans text-[#2C2926] focus:outline-none focus:border-[#2C2926]" />
                        <button id="btn-execute-search" class="bg-[#1A1817] text-white text-[10px] font-bold uppercase tracking-[0.15em] px-5 py-2 hover:bg-stone-800 transition-colors">
                            Search
                        </button>
                    </div>
                </div>
            </header>
        `;
    },

    attachEvents() {
        const btnSearch = document.getElementById('btn-toggle-search');
        const searchBar = document.getElementById('quick-search-bar');
        const searchInput = document.getElementById('global-search-input');
        const btnExecSearch = document.getElementById('btn-execute-search');

        if (btnSearch && searchBar) {
            btnSearch.onclick = () => {
                searchBar.classList.toggle('hidden');
                if (!searchBar.classList.contains('hidden') && searchInput) {
                    searchInput.focus();
                }
            };
        }

        if (btnExecSearch && searchInput) {
            btnExecSearch.onclick = () => {
                const q = searchInput.value.trim();
                if (q) {
                    window.location.hash = `#shop?search=${encodeURIComponent(q)}`;
                }
            };
            searchInput.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    btnExecSearch.click();
                }
            };
        }
    }
};
