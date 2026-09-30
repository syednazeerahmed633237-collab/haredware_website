// LOG HARDWARE - Main Application Script
// Centralized Data & Store Configuration

const WHATSAPP_NUMBER = '9019193983';

// SVG Fallback Placeholder for resilient image loading
const PLACEHOLDER_SVG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='100%25' height='100%25' fill='%23f5f2eb'/%3E%3Cpath d='M200 90 L245 118 L245 178 L200 206 L155 178 L155 118 Z' stroke='%23b85b11' stroke-width='4' fill='none'/%3E%3Cpath d='M200 90 L200 148 L245 178 M200 148 L155 178' stroke='%23b85b11' stroke-width='3' fill='none'/%3E%3Ctext x='200' y='238' text-anchor='middle' font-family='Arial, sans-serif' font-size='13' font-weight='bold' fill='%2362472f'%3ELOG HARDWARE GENUINE PART%3C/text%3E%3C/svg%3E";

// 1. Initial 12 Products
const raw = [
  ['ac-filter', 'AC Air Filter', 'AC Parts', 'LG', 'Universal washable mesh filter for split air conditioner indoor units.', 'AC-FILT-01', 'images/product-01.jpg', ['Standard', '1.5 Ton', '2 Ton']],
  ['rotary-compressor', 'Rotary AC Compressor', 'AC Parts', 'Daikin', 'Energy-efficient inverter rotary compressor for cooling reliability.', 'AC-COMP-02', 'images/product-02.jpg', ['1 Ton', '1.5 Ton', '2 Ton']],
  ['universal-remote', 'Universal AC Remote', 'Controls', 'Universal', 'Universal compatible LCD remote controller for all major AC brands.', 'AC-REM-03', 'images/product-03.jpg', ['Standard']],
  ['fan-motor', 'Indoor Fan Motor', 'AC Parts', 'Samsung', 'High-durability replacement indoor blower motor with low vibration.', 'AC-MOTOR-04', 'images/product-04.jpg', ['900 RPM', '1200 RPM']],
  ['capacitor', 'AC Capacitor', 'Electrical', 'Crompton', 'Heavy-duty motor run capacitor for air conditioner outdoor units.', 'AC-CAP-05', 'images/product-05.jpg', ['25 MFD', '35 MFD', '45 MFD']],
  ['copper-pipe', 'Copper Pipe Coil', 'Installation', 'Mandev', 'Seamless insulated copper tubing coil for HVAC refrigerant lines.', 'AC-PIPE-06', 'images/product-06.jpg', ['1/4 inch', '3/8 inch', '1/2 inch']],
  ['contactor', 'AC Contactor', 'Electrical', 'Schneider', 'Heavy-duty electrical contactor switch for compressor power circuit.', 'AC-CON-07', 'images/product-07.jpg', ['20A', '25A', '32A']],
  ['drain-pipe', 'Drain Pipe', 'Installation', 'Supreme', 'Flexible heavy-gauge corrugated drain pipe for condensate drainage.', 'AC-DRAIN-08', 'images/product-08.jpg', ['5 m', '10 m']],
  ['thermostat', 'Digital Thermostat', 'Controls', 'Honeywell', 'Digital wall-mount temperature controller with backlit display.', 'AC-THERM-09', 'images/product-09.jpg', ['Standard']],
  ['blower-wheel', 'Blower Wheel', 'AC Parts', 'Voltas', 'Precision-balanced indoor cross-flow blower wheel for split AC.', 'AC-BLOW-10', 'images/product-10.jpg', ['12 inch', '14 inch']],
  ['insulation-tape', 'Insulation Tape', 'Installation', '3M', 'Professional grade self-adhesive thermal and electrical insulation tape.', 'AC-TAPE-11', 'images/product-11.jpg', ['Single roll', 'Pack of 5']],
  ['pcb-board', 'AC PCB Board', 'Electrical', 'Carrier', 'OEM replacement electronic control board for split AC units.', 'AC-PCB-12', 'images/product-12.jpg', ['Universal', '1.5 Ton']]
];

const prices = [350, 7850, 450, 1250, 280, 950, 620, 180, 1550, 680, 120, 3200];

// Map into product objects
const products = raw.map(([id, name, category, brand, description, sku, image, sizes], index) => ({
  id, name, category, brand, description, sku, image, sizes, price: prices[index]
}));

// 2. Additional 8 Products (Making 20 total)
products.push(
  { id: 'wash-pump', name: 'Washing Machine Drain Pump', category: 'Washing Machine', brand: 'Samsung', description: 'Replacement drain pump motor for front-load and top-load machines.', sku: 'WM-PUMP-13', image: 'images/product-13.jpg', sizes: ['Universal', '6 kg', '7 kg'], price: 1250 },
  { id: 'fridge-thermostat', name: 'Refrigerator Thermostat', category: 'Refrigerator', brand: 'Whirlpool', description: 'Capillary mechanical temperature thermostat for frost & direct-cool fridges.', sku: 'REF-THERM-14', image: 'images/product-14.jpg', sizes: ['Single door', 'Double door'], price: 680 },
  { id: 'ro-filter', name: 'RO Water Filter Set', category: 'Water Purifier', brand: 'Kent', description: 'Pre-filter and activated sediment carbon filter cartridge replacement set.', sku: 'RO-FILT-15', image: 'images/product-15.jpg', sizes: ['Standard', '10 inch'], price: 550 },
  { id: 'micro-switch', name: 'Microwave Door Switch', category: 'Microwave', brand: 'LG', description: 'Heavy-duty microwave oven door safety interlock switch.', sku: 'MW-SWITCH-16', image: 'images/product-16.jpg', sizes: ['Universal'], price: 240 },
  { id: 'tool-kit', name: 'Technician Tool Kit', category: 'General Tools', brand: 'Taparia', description: 'Comprehensive appliance repair and installation hand tool set.', sku: 'TOOL-KIT-17', image: 'images/product-17.jpg', sizes: ['12 piece', '24 piece'], price: 1400 },
  { id: 'ac-pcb', name: 'Universal AC PCB Board', category: 'AC Parts', brand: 'Universal', description: 'Multi-brand split air conditioner motherboard with universal remote.', sku: 'AC-PCB-18', image: 'images/product-18.jpg', sizes: ['1 Ton', '1.5 Ton'], price: 2450 },
  { id: 'fridge-fan', name: 'Refrigerator Fan Motor', category: 'Refrigerator', brand: 'LG', description: 'Evaporator cabinet cooling air circulation fan motor.', sku: 'REF-FAN-19', image: 'images/product-19.jpg', sizes: ['Single door', 'Double door'], price: 1150 },
  { id: 'wash-inlet', name: 'Washing Machine Inlet Valve', category: 'Washing Machine', brand: 'Whirlpool', description: 'Dual solenoid electric water inlet flow valve replacement.', sku: 'WM-VALVE-20', image: 'images/product-20.jpg', sizes: ['6 kg', '7 kg', '8 kg'], price: 720 }
);

// Helpers
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
const product = id => products.find(p => p.id === id);
const safe = str => String(str ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

// Cart state in LocalStorage
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem('hardware-cart') || '[]');
  if (!Array.isArray(cart)) cart = [];
} catch (e) {
  cart = [];
}

// Render Cart Drawer
function renderCart() {
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalAmount = cart.reduce((acc, item) => {
    const p = product(item.id);
    return acc + (p ? p.price * item.qty : 0);
  }, 0);

  // Update header badges
  $$('#cartCount').forEach(el => el.textContent = count);
  const cartTotalEl = $('#cartTotal');
  if (cartTotalEl) cartTotalEl.textContent = count;
  const cartAmountEl = $('#cartAmount');
  if (cartAmountEl) cartAmountEl.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;

  const cartItemsEl = $('#cartItems');
  if (!cartItemsEl) return;

  if (!cart.length) {
    cartItemsEl.innerHTML = `
      <div class="empty-cart-state">
        <div class="empty-cart-icon">🛒</div>
        <p class="empty-cart-title">Your order list is empty</p>
        <p class="empty-cart-sub">Add spare parts from the catalogue to enquire on WhatsApp.</p>
        <a href="index.html#products-section" class="browse-spares-btn" onclick="closeCart()">Browse Spare Parts</a>
      </div>
    `;
    const sendCartBtn = $('#sendCart');
    if (sendCartBtn) sendCartBtn.disabled = true;
    return;
  }

  const sendCartBtn = $('#sendCart');
  if (sendCartBtn) sendCartBtn.disabled = false;

  cartItemsEl.innerHTML = cart.map(item => {
    const p = product(item.id);
    if (!p) return '';
    const itemSubtotal = p.price * item.qty;
    return `
      <article class="cart-item" data-key="${safe(item.key)}">
        <div class="cart-item-img">
          <img src="${safe(p.image)}" alt="${safe(p.name)}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER_SVG}'">
        </div>
        <div class="cart-item-details">
          <h3 class="cart-item-name">${safe(p.name)}</h3>
          <p class="cart-item-meta">${safe(p.brand)} · <span class="cart-item-variant">${safe(item.size)}</span></p>
          <p class="cart-item-sku">SKU: ${safe(p.sku)}</p>
          <div class="cart-item-price-row">
            <span class="cart-unit-price">₹${p.price.toLocaleString('en-IN')} × ${item.qty}</span>
            <span class="cart-line-total">₹${itemSubtotal.toLocaleString('en-IN')}</span>
          </div>
          <div class="cart-item-bottom">
            <div class="qty-stepper small-stepper">
              <button type="button" class="cart-qty-btn" data-change="-1" data-key="${safe(item.key)}" aria-label="Decrease quantity">−</button>
              <span class="cart-qty-val">${item.qty}</span>
              <button type="button" class="cart-qty-btn" data-change="1" data-key="${safe(item.key)}" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="cart-remove-btn" data-remove="${safe(item.key)}" aria-label="Remove item">Remove</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function saveCart() {
  try {
    localStorage.setItem('hardware-cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart to localStorage', e);
  }
  renderCart();
}

function addToCart(id, size, qty = 1) {
  const p = product(id);
  if (!p) return;
  const chosenSize = size || (p.sizes && p.sizes[0]) || 'Standard';
  const quantity = Math.max(1, parseInt(qty, 10) || 1);
  const key = `${id}|${chosenSize}`;

  const existing = cart.find(x => x.key === key);
  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({ key, id, size: chosenSize, qty: quantity });
  }
  saveCart();
  openCart();
}

function buildWhatsAppMessage(items) {
  const now = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const totalEst = items.reduce((sum, item) => {
    const p = product(item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  let msg = `*LOG HARDWARE - SPARE PARTS ENQUIRY*\n`;
  msg += `Store: Faizan B Hardware, KGF, Karnataka\n`;
  msg += `Date: ${now}\n\n`;
  msg += `Hello, I would like to check availability and order the following spare parts:\n\n`;

  items.forEach((item, idx) => {
    const p = product(item.id);
    if (!p) return;
    const lineTotal = p.price * item.qty;
    msg += `${idx + 1}. *${p.name}*\n`;
    msg += `   • Brand: ${p.brand}\n`;
    msg += `   • Category: ${p.category}\n`;
    msg += `   • Variant / Size: ${item.size}\n`;
    msg += `   • SKU: ${p.sku}\n`;
    msg += `   • Quantity: ${item.qty}\n`;
    msg += `   • Price: ₹${p.price.toLocaleString('en-IN')} each (₹${lineTotal.toLocaleString('en-IN')})\n\n`;
  });

  msg += `--------------------------------\n`;
  msg += `*Total Parts:* ${totalItems}\n`;
  msg += `*Estimated Total:* ₹${totalEst.toLocaleString('en-IN')}\n\n`;
  msg += `Please confirm availability, price, and pickup/delivery details. Thank you!`;

  return msg;
}

function sendWhatsApp(items) {
  if (!items || !items.length) {
    alert('Please select at least one product first.');
    return;
  }
  const textMsg = buildWhatsAppMessage(items);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(textMsg)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function openCart() {
  const panel = $('#cartPanel');
  const overlay = $('#cartOverlay');
  if (panel) {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
  }
  if (overlay) {
    overlay.classList.add('open');
  }
  document.body.classList.add('cart-open');
}

function closeCart() {
  const panel = $('#cartPanel');
  const overlay = $('#cartOverlay');
  if (panel) {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  }
  if (overlay) {
    overlay.classList.remove('open');
  }
  document.body.classList.remove('cart-open');
}

function setupCart() {
  renderCart();

  $$('#openCart').forEach(btn => {
    btn.onclick = e => {
      e.preventDefault();
      openCart();
    };
  });

  $$('[data-close-cart]').forEach(btn => {
    btn.onclick = e => {
      e.preventDefault();
      closeCart();
    };
  });

  const cartItems = $('#cartItems');
  if (cartItems) {
    cartItems.onclick = e => {
      const target = e.target.closest('button');
      if (!target) return;

      const removeKey = target.dataset.remove;
      if (removeKey) {
        cart = cart.filter(x => x.key !== removeKey);
        saveCart();
        return;
      }

      const changeKey = target.dataset.key;
      const changeVal = parseInt(target.dataset.change, 10);
      if (changeKey && !isNaN(changeVal)) {
        const item = cart.find(x => x.key === changeKey);
        if (item) {
          item.qty += changeVal;
          if (item.qty < 1) {
            cart = cart.filter(x => x.key !== changeKey);
          }
          saveCart();
        }
      }
    };
  }

  const sendCartBtn = $('#sendCart');
  if (sendCartBtn) {
    sendCartBtn.onclick = () => {
      if (cart.length > 0) {
        sendWhatsApp(cart);
      } else {
        alert('Your cart is empty. Please add items to enquiry.');
      }
    };
  }

  // Keyboard navigation: Escape key closes cart and mobile menu
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeCart();
      closeMobileMenu();
    }
  });
}

// Mobile Menu Controls
function openMobileMenu() {
  const nav = $('#mobileNav');
  const overlay = $('#mobileNavOverlay');
  const toggle = $('#menuToggle');
  if (nav) nav.classList.add('open');
  if (overlay) overlay.classList.add('open');
  if (toggle) toggle.setAttribute('aria-expanded', 'true');
  document.body.classList.add('menu-open');
}

function closeMobileMenu() {
  const nav = $('#mobileNav');
  const overlay = $('#mobileNavOverlay');
  const toggle = $('#menuToggle');
  if (nav) nav.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}

function setupMobileNav() {
  const toggle = $('#menuToggle');
  if (toggle) {
    toggle.onclick = () => {
      const nav = $('#mobileNav');
      if (nav && nav.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    };
  }

  const closeBtn = $('#closeMobileNav');
  if (closeBtn) closeBtn.onclick = closeMobileMenu;

  const overlay = $('#mobileNavOverlay');
  if (overlay) overlay.onclick = closeMobileMenu;

  $$('.mobile-nav a').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });
}

// Catalogue & Filtering System
function catalogue() {
  const catFilter = $('#categoryFilter');
  const brandFilter = $('#brandFilter');
  const sizeFilter = $('#sizeFilter');
  const searchFilter = $('#searchFilter');
  const clearBtn = $('#clearFilters');
  const countEl = $('#productCount');
  const gridEl = $('#productGrid');

  if (!gridEl || !catFilter || !brandFilter || !sizeFilter || !searchFilter) return;

  // Populate Categories
  const allCategories = [...new Set(products.map(p => p.category))].sort();
  allCategories.forEach(c => {
    if (![...catFilter.options].some(o => o.value === c)) {
      catFilter.add(new Option(c, c));
    }
  });

  // Populate Brands
  const allBrands = [...new Set(products.map(p => p.brand))].sort();
  allBrands.forEach(b => {
    if (![...brandFilter.options].some(o => o.value === b)) {
      brandFilter.add(new Option(b, b));
    }
  });

  // Populate Sizes/Models
  const allSizes = [...new Set(products.flatMap(p => p.sizes))].sort();
  allSizes.forEach(s => {
    if (![...sizeFilter.options].some(o => o.value === s)) {
      sizeFilter.add(new Option(s, s));
    }
  });

  function draw() {
    const selectedCat = catFilter.value;
    const selectedBrand = brandFilter.value;
    const selectedSize = sizeFilter.value;
    const searchVal = (searchFilter.value || '').trim().toLowerCase();

    // Update Category visual buttons if on page
    $$('.category-grid button').forEach(btn => {
      const cat = btn.getAttribute('data-category');
      if (cat && cat === selectedCat) {
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('selected');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    const filtered = products.filter(p => {
      const matchCat = (selectedCat === 'All' || p.category === selectedCat);
      const matchBrand = (selectedBrand === 'All' || p.brand === selectedBrand);
      const matchSize = (selectedSize === 'All' || (p.sizes && p.sizes.includes(selectedSize)));

      const searchHaystack = `${p.name} ${p.sku} ${p.brand} ${p.category} ${p.description}`.toLowerCase();
      const matchSearch = !searchVal || searchHaystack.includes(searchVal);

      return matchCat && matchBrand && matchSize && matchSearch;
    });

    // Update count indicator
    if (countEl) {
      countEl.textContent = `${filtered.length} product${filtered.length === 1 ? '' : 's'}`;
    }

    if (!filtered.length) {
      gridEl.innerHTML = `
        <div class="no-results-panel">
          <div class="no-results-icon">🔍</div>
          <h3>No products match your filters</h3>
          <p>We could not find any spare parts matching your current search or filter combination.</p>
          <button type="button" class="filter-clear-btn" onclick="document.getElementById('clearFilters').click()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = filtered.map(p => {
      const hasMultipleSizes = p.sizes && p.sizes.length > 1;
      const sizeOptions = (p.sizes || ['Standard']).map(s =>
        `<option value="${safe(s)}">${safe(s)}</option>`
      ).join('');

      return `
        <article class="product-card" data-id="${p.id}">
          <a href="product.html?id=${p.id}" class="card-link" aria-label="View details for ${safe(p.name)}">
            <div class="image-wrap">
              <img src="${safe(p.image)}" alt="${safe(p.name)}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER_SVG}'">
              <span class="card-tag">${safe(p.category)}</span>
            </div>
            <div class="card-copy">
              <div class="card-title-row">
                <h3 class="product-title">${safe(p.name)}</h3>
              </div>
              <p class="card-brand-meta">
                <span class="meta-brand">${safe(p.brand)}</span>
                <span class="meta-separator">•</span>
                <span class="meta-sku">${safe(p.sku)}</span>
              </p>
              <div class="card-price-row">
                <span class="product-price">₹${p.price.toLocaleString('en-IN')}</span>
                <span class="stock-badge">In Stock</span>
              </div>
            </div>
          </a>

          <div class="card-bottom-actions">
            <div class="card-options-row">
              <label class="variant-label">
                <span class="label-text">${hasMultipleSizes ? 'Variant / Size:' : 'Variant:'}</span>
                <select class="card-variant-select" data-size-for="${p.id}" aria-label="Select variant for ${safe(p.name)}">
                  ${sizeOptions}
                </select>
              </label>

              <label class="qty-label">
                <span class="label-text">Qty:</span>
                <div class="qty-stepper card-stepper">
                  <button type="button" class="stepper-btn" data-step="-1" data-target="${p.id}" aria-label="Decrease quantity">−</button>
                  <input type="number" id="qty-${p.id}" data-qty-for="${p.id}" min="1" max="99" value="1" aria-label="Quantity for ${safe(p.name)}">
                  <button type="button" class="stepper-btn" data-step="1" data-target="${p.id}" aria-label="Increase quantity">+</button>
                </div>
              </label>
            </div>

            <div class="card-button-group">
              <button type="button" class="add-cart-btn" data-add="${p.id}">
                <span class="btn-icon">🛒</span> Add to Cart
              </button>
              <button type="button" class="whatsapp-btn" data-wa="${p.id}">
                <span class="btn-icon">💬</span> WhatsApp
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach event listeners to card actions
    $$('.card-stepper .stepper-btn').forEach(btn => {
      btn.onclick = () => {
        const targetId = btn.dataset.target;
        const step = parseInt(btn.dataset.step, 10);
        const input = $(`[data-qty-for="${targetId}"]`);
        if (input) {
          const curVal = Math.max(1, parseInt(input.value, 10) || 1);
          input.value = Math.max(1, curVal + step);
        }
      };
    });

    $$('[data-add]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.add;
        const sizeSelect = $(`[data-size-for="${id}"]`);
        const chosenSize = sizeSelect ? sizeSelect.value : (product(id)?.sizes[0] || 'Standard');
        const qtyInput = $(`[data-qty-for="${id}"]`);
        const quantity = Math.max(1, parseInt(qtyInput ? qtyInput.value : 1, 10) || 1);
        addToCart(id, chosenSize, quantity);
      };
    });

    $$('[data-wa]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.wa;
        const p = product(id);
        if (!p) return;
        const sizeSelect = $(`[data-size-for="${id}"]`);
        const chosenSize = sizeSelect ? sizeSelect.value : (p.sizes[0] || 'Standard');
        const qtyInput = $(`[data-qty-for="${id}"]`);
        const quantity = Math.max(1, parseInt(qtyInput ? qtyInput.value : 1, 10) || 1);
        sendWhatsApp([{ id: p.id, size: chosenSize, qty: quantity }]);
      };
    });
  }

  // Filter Event Listeners
  [catFilter, brandFilter, sizeFilter].forEach(el => {
    el.addEventListener('change', draw);
  });
  searchFilter.addEventListener('input', draw);

  if (clearBtn) {
    clearBtn.onclick = () => {
      catFilter.value = 'All';
      brandFilter.value = 'All';
      sizeFilter.value = 'All';
      searchFilter.value = '';
      draw();
    };
  }

  // Check URL params for preselected category
  const urlParams = new URLSearchParams(window.location.search);
  const initialCat = urlParams.get('category');
  if (initialCat && allCategories.includes(initialCat)) {
    catFilter.value = initialCat;
  }

  draw();
}

// Product Detail Page Logic
function detail() {
  const box = $('#productDetail');
  if (!box) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const p = product(id);

  if (!p) {
    box.innerHTML = `
      <div class="detail-not-found">
        <h2>Spare Part Not Found</h2>
        <p>The product you are looking for does not exist or may have been updated.</p>
        <a href="index.html#products-section" class="browse-spares-btn">← Back to Catalogue</a>
      </div>
    `;
    return;
  }

  // Update Page Title
  document.title = `${p.name} - LOG HARDWARE Spares`;

  const sizeOptions = (p.sizes || ['Standard']).map(s =>
    `<option value="${safe(s)}">${safe(s)}</option>`
  ).join('');

  box.innerHTML = `
    <div class="detail-gallery">
      <div class="detail-image-wrap">
        <img src="${safe(p.image)}" alt="${safe(p.name)}" loading="lazy" onerror="this.onerror=null;this.src='${PLACEHOLDER_SVG}'">
      </div>
      <div class="detail-badges">
        <span class="detail-badge-pill">✓ 100% Genuine Spare Part</span>
        <span class="detail-badge-pill">✓ Immediate Dispatch</span>
      </div>
    </div>

    <div class="detail-content">
      <div class="detail-header-meta">
        <span class="card-tag">${safe(p.category)}</span>
        <span class="detail-stock-status">● In Stock & Ready to Dispatch</span>
      </div>

      <h1 class="detail-title">${safe(p.name)}</h1>

      <div class="detail-price-box">
        <span class="detail-price">₹${p.price.toLocaleString('en-IN')}</span>
        <span class="detail-price-tax">Includes applicable taxes</span>
      </div>

      <p class="detail-description">${safe(p.description)}</p>

      <div class="specs-table-wrap">
        <table class="specs-table">
          <tbody>
            <tr>
              <th>Brand</th>
              <td><strong>${safe(p.brand)}</strong></td>
            </tr>
            <tr>
              <th>Category</th>
              <td>${safe(p.category)}</td>
            </tr>
            <tr>
              <th>Product Code / SKU</th>
              <td><code class="sku-code">${safe(p.sku)}</code></td>
            </tr>
            <tr>
              <th>Available Sizes / Variants</th>
              <td>${p.sizes.join(', ')}</td>
            </tr>
            <tr>
              <th>Store Location</th>
              <td>Faizan B Hardware, KGF, Karnataka</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="detail-order-actions">
        <div class="detail-selection-grid">
          <label class="detail-form-label">
            <span>Select Size / Model Variant:</span>
            <select id="detailSizeSelect" class="detail-select" aria-label="Select variant">
              ${sizeOptions}
            </select>
          </label>

          <label class="detail-form-label">
            <span>Quantity:</span>
            <div class="qty-stepper detail-stepper">
              <button type="button" id="detailQtyMinus" class="stepper-btn" aria-label="Decrease quantity">−</button>
              <input type="number" id="detailQtyInput" min="1" max="99" value="1" aria-label="Quantity">
              <button type="button" id="detailQtyPlus" class="stepper-btn" aria-label="Increase quantity">+</button>
            </div>
          </label>
        </div>

        <div class="detail-cta-row">
          <button type="button" id="detailAddBtn" class="detail-add-btn">
            <span class="btn-icon">🛒</span> Add to Cart
          </button>
          <button type="button" id="detailWaBtn" class="detail-wa-btn">
            <span class="btn-icon">💬</span> Enquire on WhatsApp
          </button>
        </div>
      </div>

      <div class="store-assurance-card">
        <h4>Need assistance or bulk order?</h4>
        <p>Walk in to <strong>Faizan B Hardware</strong> in KGF, or message us directly with your appliance model number for verified fitment assistance.</p>
      </div>
    </div>
  `;

  // Stepper handlers
  const qtyInput = $('#detailQtyInput');
  const minusBtn = $('#detailQtyMinus');
  const plusBtn = $('#detailQtyPlus');
  if (minusBtn && qtyInput) {
    minusBtn.onclick = () => {
      const cur = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      qtyInput.value = Math.max(1, cur - 1);
    };
  }
  if (plusBtn && qtyInput) {
    plusBtn.onclick = () => {
      const cur = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      qtyInput.value = cur + 1;
    };
  }

  // Add to cart
  const addBtn = $('#detailAddBtn');
  if (addBtn) {
    addBtn.onclick = () => {
      const sizeVal = $('#detailSizeSelect')?.value || p.sizes[0];
      const quantity = Math.max(1, parseInt(qtyInput?.value || 1, 10) || 1);
      addToCart(p.id, sizeVal, quantity);
    };
  }

  // WhatsApp enquiry
  const waBtn = $('#detailWaBtn');
  if (waBtn) {
    waBtn.onclick = () => {
      const sizeVal = $('#detailSizeSelect')?.value || p.sizes[0];
      const quantity = Math.max(1, parseInt(qtyInput?.value || 1, 10) || 1);
      sendWhatsApp([{ id: p.id, size: sizeVal, qty: quantity }]);
    };
  }
}

// Global Category selector function (used by category cards and footer links)
window.chooseCategory = function (catName) {
  const catFilter = $('#categoryFilter');
  if (catFilter) {
    catFilter.value = catName;
    catFilter.dispatchEvent(new Event('change'));
    const section = $('#products-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    // If on product.html, navigate to index.html with param
    window.location.href = `index.html?category=${encodeURIComponent(catName)}#products-section`;
  }
};

// Global Brand filter helper
window.chooseBrand = function (brandName) {
  const brandFilter = $('#brandFilter');
  if (brandFilter) {
    brandFilter.value = brandName;
    brandFilter.dispatchEvent(new Event('change'));
    const section = $('#products-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    window.location.href = `index.html#products-section`;
  }
};

// WhatsApp direct contact helper
window.openStoreWhatsApp = function () {
  const textMsg = `Hello Faizan B Hardware, I am looking for hardware and appliance spare parts from your store in KGF. Please help me with part availability.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(textMsg)}`, '_blank', 'noopener,noreferrer');
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  setupCart();
  setupMobileNav();

  // Load Google Drive images before rendering products.
  // If Drive is unavailable or not configured, the existing
  // local images remain in use automatically.
  await loadGoogleDriveImagesIntoProducts(products);

  if ($('#productGrid')) {
    catalogue();
  }
  if ($('#productDetail')) {
    detail();
  }
});
