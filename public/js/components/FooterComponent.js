/**
 * ByInes Storefront — Reusable Footer Component
 * Can be dynamically rendered or embedded in any HTML page/template.
 */
export const FooterComponent = {
    render() {
        return `
            <footer class="bg-white border-t border-[#E5E2DC] pt-16 pb-12 px-6 mt-auto text-[#2C2926]">
                <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12">
                    <!-- Column 1: Brand Info & Social -->
                    <div class="space-y-4">
                        <h3 class="font-serif text-2xl font-normal text-[#2C2926]">Byines</h3>
                        <p class="text-xs text-[#7A7672] leading-relaxed max-w-xs">
                            Redefining modest fashion through timeless elegance and contemporary silhouettes.
                        </p>
                        <div class="flex items-center space-x-3 pt-2">
                            <a href="#" class="w-7 h-7 rounded-full border border-[#E5E2DC] flex items-center justify-center text-xs text-[#7A7672] hover:border-[#2C2926] hover:text-[#2C2926] transition-colors">ig</a>
                            <a href="#" class="w-7 h-7 rounded-full border border-[#E5E2DC] flex items-center justify-center text-xs text-[#7A7672] hover:border-[#2C2926] hover:text-[#2C2926] transition-colors">fb</a>
                            <a href="#" class="w-7 h-7 rounded-full border border-[#E5E2DC] flex items-center justify-center text-xs text-[#7A7672] hover:border-[#2C2926] hover:text-[#2C2926] transition-colors">tk</a>
                        </div>
                    </div>

                    <!-- Column 2: Shopping -->
                    <div class="space-y-3">
                        <h4 class="text-[10px] uppercase tracking-[0.18em] text-[#2C2926] font-bold">SHOPPING</h4>
                        <ul class="space-y-2 text-xs text-[#7A7672]">
                            <li><a href="#shop" class="hover:text-[#2C2926] transition-colors">New Arrivals</a></li>
                            <li><a href="#shop" class="hover:text-[#2C2926] transition-colors">Best Sellers</a></li>
                            <li><a href="#shop" class="hover:text-[#2C2926] transition-colors">Sale Items</a></li>
                        </ul>
                    </div>

                    <!-- Column 3: Customer Service -->
                    <div class="space-y-3">
                        <h4 class="text-[10px] uppercase tracking-[0.18em] text-[#2C2926] font-bold">CUSTOMER SERVICE</h4>
                        <ul class="space-y-2 text-xs text-[#7A7672]">
                            <li><a href="#about" class="hover:text-[#2C2926] transition-colors">Contact Us</a></li>
                            <li><a href="#about" class="hover:text-[#2C2926] transition-colors">Shipping & Returns</a></li>
                            <li><a href="#about" class="hover:text-[#2C2926] transition-colors">Size Guide</a></li>
                        </ul>
                    </div>

                    <!-- Column 4: Newsletter -->
                    <div class="space-y-3">
                        <h4 class="text-[10px] uppercase tracking-[0.18em] text-[#2C2926] font-bold">NEWSLETTER</h4>
                        <p class="text-xs text-[#7A7672]">Join our mailing list for early access and editorial stories.</p>
                        <form id="newsletter-form" class="space-y-2 pt-1" onsubmit="event.preventDefault(); alert('Thank you for joining Byines mailing list.');">
                            <input type="email" required placeholder="Email Address" class="w-full px-4 py-2 bg-[#F9F8F6] border border-[#E5E2DC] text-xs font-sans text-[#2C2926] focus:outline-none focus:border-[#2C2926]" />
                            <button type="submit" class="w-full bg-[#1A1817] text-white text-[10px] font-bold uppercase tracking-[0.18em] py-2.5 hover:bg-stone-800 transition-colors">
                                SUBSCRIBE
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Copyright Bottom -->
                <div class="max-w-6xl mx-auto pt-6 border-t border-[#E5E2DC] flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#7A7672] gap-2">
                    <div>
                        &copy; 2026 ByInes. All rights reserved.
                    </div>
                    <div class="flex items-center space-x-4">
                        <a href="#about" class="hover:text-[#2C2926]">Privacy Policy</a>
                        <a href="#about" class="hover:text-[#2C2926]">Terms of Service</a>
                    </div>
                </div>
            </footer>
        `;
    }
};
