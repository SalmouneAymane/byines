/** Product page interactions. */

// global variables initialized by product.php
let productVariants = [];
let productImages = [];
let basePrice = 0.00;
let selectedColor = "";
let selectedSize = "";
let currentProductId = 0;

/** Initialize product page controls. */
function initProductPage(variants, images, base, pid) {
    productVariants = variants;
    productImages = images;
    basePrice = parseFloat(base);
    currentProductId = parseInt(pid);

    // initialize infinite scroll
    setupInfiniteScroll();

    // auto-select the first available color and size
    const colorButtons = document.querySelectorAll('.color-btn');
    const sizeButtons = document.querySelectorAll('.size-btn');

    if (colorButtons.length > 0) {
        selectColor(colorButtons[0], false); // pass false so we don't switch image on page load
    } else {
        // no colors, but check sizes
        if (sizeButtons.length > 0) {
            selectSize(sizeButtons[0]);
        }
    }
}

/** Handle thumbnail hover/click to update main image. */
function updateMainImage(src, elementToCenter = null) {
    const mainImage = document.getElementById('mainImage');
    if (!mainImage) return;
    mainImage.src = src;
    
    // clear styles from all thumbnails
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.style.border = '2px solid transparent';
        thumb.style.opacity = '0.6';
    });

    // highlight and center the correct element
    let target = elementToCenter;
    if (!target) {
        const gallery = document.querySelector('.thumbnail-gallery');
        const allMatching = Array.from(document.querySelectorAll('.thumbnail')).filter(thumb => thumb.src === src);
        if (gallery && allMatching.length > 0) {
            // find the copy closest to the current scroll center of the gallery
            const containerCenter = gallery.scrollLeft + (gallery.clientWidth / 2);
            let minDistance = Infinity;
            allMatching.forEach(thumb => {
                const thumbCenter = thumb.offsetLeft + (thumb.clientWidth / 2);
                const distance = Math.abs(thumbCenter - containerCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                    target = thumb;
                }
            });
        } else {
            target = allMatching[0];
        }
    }

    if (target) {
        target.style.border = '2px solid var(--brand-dark)';
        target.style.opacity = '1';
        target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
}

/** Setup infinite scroll carousel for thumbnails. */
function setupInfiniteScroll() {
    const gallery = document.querySelector('.thumbnail-gallery');
    if (!gallery) return;

    const originalItems = Array.from(gallery.querySelectorAll('.thumbnail'));
    const count = originalItems.length;
    if (count <= 1) return;

    // clone items multiple times to enable infinite scrolling in both directions
    for (let i = 0; i < 4; i++) {
        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.onclick = function() {
                updateMainImage(clone.src, clone);
            };
            gallery.appendChild(clone);
        });
    }

    // wrap-around scroll logic
    setTimeout(() => {
        // calculate width of one original set including gap
        const itemWidth = originalItems[0].getBoundingClientRect().width;
        const gap = 12; // 0.75rem in pixels
        const setWidth = count * (itemWidth + gap);

        // reset all thumbnail styles initially
        gallery.querySelectorAll('.thumbnail').forEach(t => {
            t.style.border = '2px solid transparent';
            t.style.opacity = '0.6';
        });

        // center on the active thumbnail in the second set (middle copy)
        const mainImage = document.getElementById('mainImage');
        if (mainImage) {
            const allMatchingThumbs = Array.from(gallery.querySelectorAll('.thumbnail')).filter(t => t.src === mainImage.src);
            const targetThumb = allMatchingThumbs[1] || allMatchingThumbs[0];
            if (targetThumb) {
                targetThumb.style.border = '2px solid var(--brand-dark)';
                targetThumb.style.opacity = '1';
                targetThumb.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
            }
        } else {
            // fallback: just scroll to the middle item
            gallery.scrollLeft = setWidth;
        }

        gallery.addEventListener('scroll', () => {
            // if scrolled near the start, jump forward by one set width
            if (gallery.scrollLeft < 20) {
                gallery.scrollLeft += setWidth;
            } 
            // if scrolled near the end, jump back by one set width
            else if (gallery.scrollLeft >= (gallery.scrollWidth - gallery.clientWidth - 20)) {
                gallery.scrollLeft -= setWidth;
            }
        });
    }, 200);
}

/** Switch main image to first matching selected color. */
function jumpToColorImage(color) {
    const thumbnails = document.querySelectorAll('.thumbnail');
    let firstMatchSrc = '';

    thumbnails.forEach(thumb => {
        const thumbColor = thumb.getAttribute('data-color');
        if (thumbColor && thumbColor.toLowerCase() === color.toLowerCase()) {
            if (!firstMatchSrc) {
                firstMatchSrc = thumb.src;
            }
        }
    });

    if (firstMatchSrc) {
        updateMainImage(firstMatchSrc);
    }
}

/** Handle color button click. */
function selectColor(button, updateImage = true) {
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.border = '2px solid transparent';
    });

    button.classList.add('active');
    button.style.border = '2px solid var(--brand-dark)';
    
    selectedColor = button.getAttribute('data-color');
    
    const colorLabel = document.getElementById('selectedColor');
    if (colorLabel) {
        colorLabel.innerHTML = 'Selected: <strong>' + selectedColor + '</strong>';
    }

    // switch main image to this color's view if not initial load
    if (updateImage) {
        jumpToColorImage(selectedColor);
    }

    // update sizes based on this color
    updateSizeAvailability();

    // check variant matching
    checkVariant();
}

/** Adjust size buttons based on stock for selected color. */
function updateSizeAvailability() {
    const sizeButtons = document.querySelectorAll('.size-btn');
    let firstAvailableSizeBtn = null;
    let currentlySelectedStillAvailable = false;

    sizeButtons.forEach(btn => {
        const size = btn.getAttribute('data-size');
        // find if this variant exists and has stock
        const variant = productVariants.find(v => v.color.toLowerCase() === selectedColor.toLowerCase() && v.size === size);
        
        if (variant) {
            const hasStock = parseInt(variant.stock_quantity) > 0;
            if (hasStock) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                if (!firstAvailableSizeBtn) {
                    firstAvailableSizeBtn = btn;
                }
                if (size === selectedSize) {
                    currentlySelectedStillAvailable = true;
                }
            } else {
                btn.disabled = false; // still selectable but maybe out of stock
                btn.style.opacity = '0.5';
            }
        } else {
            // variant combination does not exist in database
            btn.disabled = false; 
            btn.style.opacity = '0.4';
        }
    });

    // if current selected size is unavailable, select the first available
    if (!currentlySelectedStillAvailable && firstAvailableSizeBtn) {
        selectSize(firstAvailableSizeBtn);
    } else {
        // find and highlight currently selected size button
        const activeBtn = Array.from(sizeButtons).find(btn => btn.getAttribute('data-size') === selectedSize);
        if (activeBtn) {
            selectSize(activeBtn);
        }
    }
}

/** Handle size button click. */
function selectSize(button) {
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.border = '1px solid var(--gray-300)';
        btn.style.backgroundColor = 'transparent';
    });

    button.classList.add('active');
    button.style.border = '2px solid var(--brand-dark)';
    button.style.backgroundColor = 'rgba(26, 26, 26, 0.05)';

    selectedSize = button.getAttribute('data-size');

    // check variant matching
    checkVariant();
}

/** Match selection to variant list and update price/stock/buttons. */
function checkVariant() {
    const priceDisplay = document.getElementById('productPrice');
    const stockDisplay = document.getElementById('stockStatus');
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const buyNowBtn = document.querySelector('.buy-now-btn');

    // reset qty input to 1
    const qtyInput = document.getElementById('quantity');
    if (qtyInput) qtyInput.value = 1;

    // find matching variant
    const variant = productVariants.find(
        v => v.color.toLowerCase() === selectedColor.toLowerCase() && v.size === selectedSize
    );

    if (variant) {
        // calculate dynamic price
        const priceModifier = parseFloat(variant.price_modifier || 0.00);
        const finalPrice = basePrice + priceModifier;
        if (priceDisplay) {
            priceDisplay.textContent = '$' + finalPrice.toFixed(2);
        }

        const stock = parseInt(variant.stock_quantity);

        if (stock > 0) {
            if (stockDisplay) {
                stockDisplay.innerHTML = `<span style="color: #4B7A57; font-weight: 600;">✓ In Stock (${stock} available)</span>`;
            }
            if (addToCartBtn) addToCartBtn.disabled = false;
            if (buyNowBtn) buyNowBtn.disabled = false;
        } else {
            if (stockDisplay) {
                stockDisplay.innerHTML = `<span style="color: #A34848; font-weight: 600;">✕ Out of Stock</span>`;
            }
            if (addToCartBtn) addToCartBtn.disabled = true;
            if (buyNowBtn) buyNowBtn.disabled = true;
        }
    } else {
        // no matching variant found in database
        if (priceDisplay) {
            priceDisplay.textContent = '$' + basePrice.toFixed(2);
        }
        if (stockDisplay) {
            stockDisplay.innerHTML = `<span style="color: #A34848; font-weight: 600;">✕ Combination Unavailable</span>`;
        }
        if (addToCartBtn) addToCartBtn.disabled = true;
        if (buyNowBtn) buyNowBtn.disabled = true;
    }
}

/** Handle quantity increment. */
function increaseQuantity() {
    const qtyInput = document.getElementById('quantity');
    if (!qtyInput) return;

    // find current variant to get stock limit
    const variant = productVariants.find(
        v => v.color.toLowerCase() === selectedColor.toLowerCase() && v.size === selectedSize
    );

    const maxStock = variant ? parseInt(variant.stock_quantity) : 1;
    const currentVal = parseInt(qtyInput.value);

    if (currentVal < maxStock) {
        qtyInput.value = currentVal + 1;
    }
}

/** Handle quantity decrement. */
function decreaseQuantity() {
    const qtyInput = document.getElementById('quantity');
    if (!qtyInput) return;

    const currentVal = parseInt(qtyInput.value);
    if (currentVal > 1) {
        qtyInput.value = currentVal - 1;
    }
}

/** Handle add to cart action. */
function addToCart() {
    const qtyInput = document.getElementById('quantity');
    const quantity = qtyInput ? qtyInput.value : 1;
    
    // find current variant
    const variant = productVariants.find(
        v => v.color.toLowerCase() === selectedColor.toLowerCase() && v.size === selectedSize
    );

    if (!variant) {
        alert('Please select a valid variant combination.');
        return;
    }

    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const originalText = addToCartBtn.innerHTML;
    addToCartBtn.innerHTML = 'Adding...';
    addToCartBtn.disabled = true;

    // send ajax request
    const formData = new FormData();
    formData.append('action', 'add');
    formData.append('product_id', currentProductId);
    formData.append('color', selectedColor);
    formData.append('size', selectedSize);
    formData.append('quantity', quantity);

    fetch('cart_action.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // update cart badge in header
            const cartBadge = document.getElementById('cart-badge-count');
            if (cartBadge) {
                cartBadge.innerText = data.cartCount;
                cartBadge.style.display = data.cartCount > 0 ? 'flex' : 'none';
                
                // add a small bounce animation to the badge
                cartBadge.style.transform = 'translate(25%, -25%) scale(1.3)';
                setTimeout(() => { cartBadge.style.transform = 'translate(25%, -25%) scale(1)'; }, 300);
            }
            
            // visual feedback on button
            addToCartBtn.innerHTML = 'Added to Cart ✓';
            addToCartBtn.style.backgroundColor = '#4CAF50';
            addToCartBtn.style.color = 'white';
            
            setTimeout(() => {
                addToCartBtn.innerHTML = originalText;
                addToCartBtn.style.backgroundColor = '';
                
                addToCartBtn.style.color = '';
                addToCartBtn.disabled = false;
            }, 2000);
            
        } else {
            alert(data.message || 'Error adding to cart.');
            addToCartBtn.innerHTML = originalText;
            addToCartBtn.disabled = false;
        }
    })
    .catch(err => {
        console.error(err);
        alert('A network error occurred.');
        addToCartBtn.innerHTML = originalText;
        addToCartBtn.disabled = false;
    });
}

/** Handle buy now action. */
function buyNow() {
    const qtyInput = document.getElementById('quantity');
    const quantity = qtyInput ? qtyInput.value : 1;
    
    // find current variant
    const variant = productVariants.find(
        v => v.color.toLowerCase() === selectedColor.toLowerCase() && v.size === selectedSize
    );

    if (!variant) {
        alert('Please select a valid variant combination.');
        return;
    }

    alert(`Proceeding to checkout with ${quantity} item(s) (${selectedColor} / Size ${selectedSize})...`);
    // redirect to checkout page in real application
}

// auto-initialize from data attributes
document.addEventListener('DOMContentLoaded', function() {
    const productPage = document.querySelector('.product-page');
    if (productPage) {
        try {
            const variants = JSON.parse(productPage.dataset.variants);
            const images = JSON.parse(productPage.dataset.images);
            const basePrice = productPage.dataset.basePrice;
            const productId = productPage.dataset.productId;
            initProductPage(variants, images, basePrice, productId);
        } catch (e) {
            console.error('Failed to initialize product page:', e);
        }
    }
});
