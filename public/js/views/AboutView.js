export const AboutView = {
    async render() {
        return `
            <div class="max-w-5xl mx-auto px-6 py-16 space-y-16">
                <!-- Hero Header -->
                <div class="text-center space-y-4 max-w-2xl mx-auto">
                    <span class="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-semibold block">Brand Philosophy</span>
                    <h1 class="text-4xl md:text-5xl font-serif font-normal text-obsidian tracking-wide">The Ethos of ByInes</h1>
                    <div class="w-12 h-px bg-obsidian mx-auto"></div>
                    <p class="text-sm text-stone-600 font-serif leading-relaxed italic">
                        "Elegance is not about standing out, but about being remembered."
                    </p>
                </div>

                <!-- Content Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div class="space-y-6 text-xs text-stone-600 leading-relaxed">
                        <h2 class="text-2xl font-serif font-normal text-obsidian">Timeless Luxury Modesty</h2>
                        <p>
                            Founded with a singular vision, ByInes redefines contemporary modest fashion by pairing traditional artisanal craftsmanship with architectural, modern silhouettes. Every garment is cut from luxury fabrics—silk, crepe, chiffon, and viscose blends—sourced for exceptional drape and enduring comfort.
                        </p>
                        <p>
                            Designed in Morocco for women around the world, our abayas, ensembles, and scarfs capture quiet confidence and timeless poise without compromising on modest values.
                        </p>
                    </div>

                    <div class="bg-stone-100 p-8 border border-line rounded-none space-y-4">
                        <div class="border-b border-line pb-4">
                            <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-obsidian">Craftsmanship</h3>
                            <p class="text-[11px] text-stone-500 mt-1">Hand-picked textiles and precise geometric tailoring.</p>
                        </div>
                        <div class="border-b border-line pb-4">
                            <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-obsidian">Moroccan Heritage</h3>
                            <p class="text-[11px] text-stone-500 mt-1">Nationwide Express Cash-On-Delivery across all Moroccan cities.</p>
                        </div>
                        <div>
                            <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-obsidian">Sustainability</h3>
                            <p class="text-[11px] text-stone-500 mt-1">Limited-edition capsule releases to eliminate textile waste.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
