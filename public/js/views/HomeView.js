import { CartState } from '../cart.js';
import { i18n } from '../i18n.js';

export const HomeView = {
    async render() {
        let collections = [];
        let featuredProducts = [];
        let categories = [];

        try {
            const res = await fetch('/api/storefront/home.php');
            const result = await res.json();
            if (result.success) {
                collections = result.data.collections || [];
                featuredProducts = result.data.featured_products || [];
                categories = result.data.categories || [];
            }
        } catch (e) {
            console.error('Failed to load homepage data', e);
        }

        // Limit collections display to exactly 2 cards
        const displayCollections = collections.slice(0, 2);

        // Duplicate products array to ensure a rich infinite carousel loop
        const carouselProducts = featuredProducts.length > 0 
            ? [...featuredProducts, ...featuredProducts, ...featuredProducts]
            : [];

        setTimeout(() => this.attachEvents(featuredProducts, carouselProducts.length), 0);

        return `
            <div class="space-y-20 pb-20">

                <!-- 1. Full-Width Hero Section -->
                <section class="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
                    <!-- Hero Image -->
                    <img src="/public/assets/hero/hero.jpg" onerror="this.src='https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=80';" alt="Timeless Elegance" class="absolute inset-0 w-full h-full object-cover object-center" />
                    
                    <!-- Dark Vignette Overlay -->
                    <div class="absolute inset-0 bg-black/25"></div>

                    <!-- Centered Overlay Content -->
                    <div class="relative z-10 text-center text-white space-y-6 px-6 max-w-3xl">
                        <h1 class="text-4xl sm:text-6xl md:text-7xl font-serif font-normal tracking-wide drop-shadow-sm leading-tight">
                            ${i18n.t('hero.title')}
                        </h1>
                        <div>
                            <a href="#shop" class="inline-block bg-white text-[#2C2926] text-xs font-semibold uppercase tracking-[0.18em] px-8 py-3.5 hover:bg-stone-100 transition-all shadow-md">
                                ${i18n.t('hero.start_shopping')}
                            </a>
                        </div>
                    </div>
                </section>

                <!-- 2. "Popular Picks" Professional Infinite Carousel -->
                <section class="max-w-6xl mx-auto px-6 space-y-8">
                    <h2 class="text-3xl font-serif font-normal text-[#2C2926] text-center">
                        ${i18n.t('popular.title')}
                    </h2>

                    <!-- Relative Container with Left/Right Floating Navigation Buttons -->
                    <div class="relative group">
                        
                        <!-- Left Floating Arrow Button -->
                        <button id="popular-prev" aria-label="Previous" class="absolute left-0 -ml-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur border border-[#E5E2DC] text-[#2C2926] hover:bg-[#2C2926] hover:text-white hover:border-[#2C2926] shadow-lg flex items-center justify-center transition-all hover:scale-110 focus:outline-none">
                            <svg class="w-5 h-5 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 19l-7-7 7-7"/></svg>
                        </button>

                        <!-- Right Floating Arrow Button -->
                        <button id="popular-next" aria-label="Next" class="absolute right-0 -mr-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur border border-[#E5E2DC] text-[#2C2926] hover:bg-[#2C2926] hover:text-white hover:border-[#2C2926] shadow-lg flex items-center justify-center transition-all hover:scale-110 focus:outline-none">
                            <svg class="w-5 h-5 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 5l7 7-7 7"/></svg>
                        </button>

                        <!-- Overflow-Hidden Viewport -->
                        <div class="overflow-hidden py-2 px-1">
                            <!-- Animated Track -->
                            <div id="popular-track" class="flex transition-transform duration-500 ease-out space-x-6">
                                ${carouselProducts.map((prod, index) => {
                                    const mainImg = prod.main_image 
                                        ? (prod.main_image.startsWith('prod_') ? `/public/uploads/products/${prod.main_image}` : `/assets/products/${prod.main_image}`)
                                        : 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80';

                                    return `
                                        <div class="group space-y-3 w-[calc(100%-0px)] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0">
                                            <!-- Image Box with Soft Rounded Corners -->
                                            <div class="relative aspect-[3/4] bg-[#EFECE6] rounded-xl overflow-hidden shadow-sm">
                                                <a href="#product/${prod.id}" class="block w-full h-full">
                                                    <img src="${mainImg}" onerror="this.src='https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80';" alt="${prod.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                </a>

                                                <!-- Quick-Add Bag Floating Icon Button -->
                                                <button data-quick-add="${prod.id}" aria-label="Add to Bag" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur border border-[#E5E2DC] shadow-sm flex items-center justify-center text-[#2C2926] hover:scale-110 transition-transform">
                                                    <svg class="w-4 h-4 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                                                </button>
                                            </div>

                                            <!-- Product Details Below -->
                                            <div>
                                                <a href="#product/${prod.id}" class="font-serif text-sm text-[#2C2926] hover:underline block leading-snug truncate">
                                                    ${prod.name}
                                                </a>
                                                <span class="text-xs text-[#7A7672] font-sans mt-0.5 block">
                                                    $${parseFloat(prod.price).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                    </div>
                </section>

                <!-- 3. Collection Banner Cards Grid Section (Exactly 2 Cards with Blurred/Darkened Image Background) -->
                <section class="max-w-6xl mx-auto px-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        ${displayCollections.map(col => {
                            const imgSrc = col.image_path 
                                ? (col.image_path.startsWith('col_') ? `/public/uploads/collections/${col.image_path}` : `/assets/collections/${col.image_path}`)
                                : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80';

                            return `
                                <div class="relative overflow-hidden rounded-2xl p-8 flex items-center justify-between shadow-md border border-[#E5E2DC]/40 min-h-[165px]">
                                    <!-- Blurred & Darkened Image Background -->
                                    <img src="${imgSrc}" onerror="this.src='https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80';" alt="" class="absolute inset-0 w-full h-full object-cover filter blur-md scale-110 brightness-[0.4]" />
                                    <div class="absolute inset-0 bg-black/25"></div>

                                    <!-- Card Content (Left) -->
                                    <div class="relative z-10 space-y-4 pr-4">
                                        <h3 class="text-2xl md:text-3xl font-serif font-normal text-white drop-shadow-sm">${col.title}</h3>
                                        <a href="#shop?collection=${col.id}" class="inline-block border border-white/80 text-[11px] font-semibold uppercase tracking-[0.15em] text-white bg-black/20 backdrop-blur-sm py-2.5 px-6 hover:bg-white hover:text-[#2C2926] transition-colors">
                                            ${i18n.t('collections.shop_now')}
                                        </a>
                                    </div>

                                    <!-- Crisp Thumbnail (Right) -->
                                    <div class="relative z-10 w-36 h-32 md:w-44 md:h-36 rounded-xl overflow-hidden shrink-0 border border-white/30 shadow-xl">
                                        <img src="${imgSrc}" onerror="this.src='https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80';" alt="${col.title}" class="w-full h-full object-cover" />
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </section>

                <!-- 4. "Browse by Category" Circular Masks Section -->
                <section class="max-w-5xl mx-auto px-6 space-y-10">
                    <h2 class="text-3xl font-serif font-normal text-[#2C2926] text-center">
                        ${i18n.t('categories.title')}
                    </h2>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        ${categories.map(cat => {
                            const catImg = cat.image_url 
                                ? (cat.image_url.startsWith('cat_') ? `/public/uploads/categories/${cat.image_url}` : `/assets/categories/${cat.image_url}`)
                                : 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80';

                            return `
                                <a href="#shop?category=${cat.id}" class="group block space-y-3">
                                    <div class="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden mx-auto shadow-md border-2 border-white group-hover:scale-105 transition-transform duration-500">
                                        <img src="${catImg}" onerror="this.src='https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80';" alt="${cat.name}" class="w-full h-full object-cover" />
                                    </div>
                                    <span class="font-serif text-base font-medium text-[#2C2926] block group-hover:underline">
                                        ${cat.name}
                                    </span>
                                </a>
                            `;
                        }).join('')}
                    </div>
                </section>

            </div>
        `;
    },

    attachEvents(products, totalCarouselCount) {
        const track = document.getElementById('popular-track');
        const btnPrev = document.getElementById('popular-prev');
        const btnNext = document.getElementById('popular-next');

        if (track && btnPrev && btnNext && totalCarouselCount > 0) {
            let currentIndex = 0;

            const getVisibleCards = () => {
                if (window.innerWidth >= 1024) return 4;
                if (window.innerWidth >= 640) return 2;
                return 1;
            };

            const updatePosition = (animate = true) => {
                const visible = getVisibleCards();
                const maxIndex = totalCarouselCount - visible;
                if (currentIndex > maxIndex) currentIndex = 0;
                if (currentIndex < 0) currentIndex = maxIndex;

                const firstCard = track.children[0];
                if (firstCard) {
                    const cardWidth = firstCard.getBoundingClientRect().width;
                    const gap = 24; // 1.5rem gap
                    const offset = currentIndex * (cardWidth + gap);
                    if (!animate) {
                        track.style.transition = 'none';
                    } else {
                        track.style.transition = 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1)';
                    }
                    track.style.transform = `translateX(-${offset}px)`;
                }
            };

            btnNext.onclick = () => {
                currentIndex++;
                updatePosition(true);
            };

            btnPrev.onclick = () => {
                currentIndex--;
                updatePosition(true);
            };

            window.addEventListener('resize', () => updatePosition(false));
        }

        // Quick Add Bag Event Listeners
        document.querySelectorAll('[data-quick-add]').forEach(btn => {
            btn.onclick = () => {
                const prodId = btn.getAttribute('data-quick-add');
                const target = products.find(p => String(p.id) === String(prodId));
                if (target) {
                    CartState.addItem(target, null, 1);
                    btn.classList.add('bg-[#1A1817]', 'text-white');
                    btn.innerHTML = '✓';
                    setTimeout(() => {
                        btn.classList.remove('bg-[#1A1817]', 'text-white');
                        btn.innerHTML = `<svg class="w-4 h-4 stroke-current" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`;
                    }, 1500);
                }
            };
        });
    }
};

window.HomeView = HomeView;
