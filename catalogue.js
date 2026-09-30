/* LOG HARDWARE - category catalogue */
(function () {
  'use strict';

  let allProducts = [];
  let selectedCategory = 'all';
  let selectedBrand = 'all';
  let searchText = '';

  const $ = id => document.getElementById(id);
  const grid = $('productGrid');
  const count = $('productCount');
  const search = $('searchFilter');
  const category = $('categoryFilter');
  const brand = $('brandFilter');
  const clear = $('clearFilters');

  function slug(value) {
    return String(value || '')
      .trim().toLowerCase()
      .replace(/[_\s]+/g, '-')
      .replace(/-+/g, '-');
  }

  function title(value) {
    return String(value || '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function esc(value) {
    return String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  function driveImageUrl(fileId) {
    return fileId ? 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(fileId) + '&sz=w1600' : '';
  }

  function parseFilename(filename) {
    if (!filename) return null;
    const name = String(filename).replace(/\.[^/.]+$/, '');
    let m = name.match(/^(.+?)-C-(.+?)-B-(.+?)-S-(.+?)-CO-(.+)$/i);
    if (m) {
      return {
        product: slug(m[1]),
        category: slug(m[2]),
        brand: slug(m[3]),
        partNumber: String(m[4] || '').trim(),
        coCode: String(m[5] || '').trim()
      };
    }
    // Backward-compatible format used by some existing Drive files:
    // product-C-category-B-brand-S-partNumber.ext
    m = name.match(/^(.+?)-C-(.+?)-B-(.+?)-S-(.+)$/i);
    if (m) {
      return {
        product: slug(m[1]),
        category: slug(m[2]),
        brand: slug(m[3]),
        partNumber: String(m[4] || '').trim(),
        coCode: ''
      };
    }
    console.warn('Skipped file with invalid filename:', filename);
    return null;
  }

  function urlParams() { return new URLSearchParams(location.search); }

  function setHeader() {
    const requested = selectedCategory === 'all' ? 'Spare Parts' : title(selectedCategory) + ' Spare Parts';
    const h = $('categoryPageTitle');
    const d = $('categoryPageDescription');
    const n = $('categoryNote');
    if (h) h.textContent = requested;
    if (d) d.textContent = selectedCategory === 'all'
      ? 'Browse genuine appliance and hardware spare parts available from LOG HARDWARE.'
      : 'Browse genuine ' + title(selectedCategory) + ' spare parts available from LOG HARDWARE.';
    if (n) n.textContent = selectedCategory === 'all' ? 'all categories' : title(selectedCategory);
    document.title = requested + ' | LOG HARDWARE';
  }

  function showMessage(heading, message, icon='⚠️') {
    if (!grid) return;
    grid.innerHTML = `<div style="grid-column:1/-1;background:#fff;border:1px solid #e4caca;border-radius:16px;padding:40px 24px;text-align:center"><div style="font-size:38px;margin-bottom:12px">${icon}</div><h3 style="margin:0 0 8px;color:#4a3424">${esc(heading)}</h3><p style="margin:0;color:#83776d;line-height:1.6">${esc(message)}</p></div>`;
  }

  function loading() {
    if (!grid) return;
    grid.innerHTML = '<div style="grid-column:1/-1;padding:50px 20px;text-align:center"><div style="width:36px;height:36px;margin:0 auto 15px;border:3px solid #e5ddd4;border-top-color:#b97825;border-radius:50%;animation:hardwareSpin .8s linear infinite"></div><strong>Loading spare parts...</strong><p style="margin-top:8px;color:#83776d">Reading the Google Drive catalogue.</p></div>';
  }

  function populateCategories() {
    if (!category) return;
    const values = [...new Set(allProducts.map(p => slug(p.category)).filter(Boolean))].sort();
    category.innerHTML = '<option value="all">All Categories</option>' + values.map(v => `<option value="${esc(v)}">${esc(title(v))}</option>`).join('');
    category.value = selectedCategory;
  }

  function populateBrands() {
    if (!brand) return;
    const values = [...new Set(allProducts.filter(p => selectedCategory === 'all' || slug(p.category) === selectedCategory).map(p => slug(p.brand)).filter(Boolean))].sort();
    brand.innerHTML = '<option value="all">All Brands</option>' + values.map(v => `<option value="${esc(v)}">${esc(title(v))}</option>`).join('');
    if (values.includes(selectedBrand)) brand.value = selectedBrand;
    else { selectedBrand = 'all'; brand.value = 'all'; }
  }

  function matches(p) {
    if (selectedCategory !== 'all' && slug(p.category) !== selectedCategory) return false;
    if (selectedBrand !== 'all' && slug(p.brand) !== selectedBrand) return false;
    if (searchText) {
      const hay = [p.product,p.category,p.brand,p.partNumber,p.coCode,p.filename].join(' ').toLowerCase();
      if (!hay.includes(searchText)) return false;
    }
    return true;
  }

  function card(p) {
    const el = document.createElement('article');
    el.className = 'product-card';
    el.innerHTML = `
      <div class="image-wrap">
        <img src="${esc(p.image)}" alt="${esc(title(p.product))}" loading="lazy">
        <span class="card-tag">${esc(title(p.category))}</span>
      </div>
      <div class="product-card-body">
        <h3 class="product-title">${esc(title(p.product))}</h3>
        <div class="product-info-list">
          <div class="product-info-row"><span>Category</span><strong>${esc(title(p.category))}</strong></div>
          <div class="product-info-row"><span>Brand</span><strong>${esc(title(p.brand))}</strong></div>
          <div class="product-info-row"><span>Part Number</span><strong>${esc(p.partNumber)}</strong></div>
          <div class="product-info-row"><span>CO Code</span><strong>${esc(p.coCode)}</strong></div>
        </div>
        <div class="product-actions">
          <button type="button" class="add-cart-button view-part">View Part</button>
          <button type="button" class="product-whatsapp-button enquire-part">💬 Enquire</button>
        </div>
      </div>`;

    el.querySelector('img').addEventListener('error', function () {
      this.style.display='none';
      this.parentElement.insertAdjacentHTML('afterbegin','<div style="padding:45px 15px;text-align:center;color:#83776d">Image unavailable</div>');
    });
    el.querySelector('.view-part').addEventListener('click', () => window.open(p.image, '_blank'));
    el.querySelector('.enquire-part').addEventListener('click', () => {
      const msg = `Hello LOG HARDWARE, I need this spare part. Product: ${title(p.product)}, Category: ${title(p.category)}, Brand: ${title(p.brand)}, Part Number: ${p.partNumber}, CO Code: ${p.coCode}`;
      const phone = '919999999999';
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    });
    return el;
  }

  function render() {
    if (!grid) return;
    const products = allProducts.filter(matches);
    if (count) count.innerHTML = `<strong>${products.length} ${products.length === 1 ? 'product' : 'products'}</strong>`;
    grid.innerHTML = '';
    if (!products.length) {
      showMessage('No spare parts found', 'No products match this category or the selected filters.', '🔎');
      return;
    }
    const frag = document.createDocumentFragment();
    products.forEach(p => frag.appendChild(card(p)));
    grid.appendChild(frag);
  }

  async function init() {
    const params = urlParams();
    selectedCategory = slug(params.get('category') || 'all') || 'all';
    selectedBrand = slug(params.get('brand') || 'all') || 'all';
    setHeader();
    loading();

    if (!window.GoogleDriveConnector || typeof window.GoogleDriveConnector.getGoogleDriveImages !== 'function') {
      showMessage('Google Drive connector is missing', 'google_drive.js did not load correctly.');
      return;
    }

    try {
      const files = await window.GoogleDriveConnector.getGoogleDriveImages();
      console.log('Google Drive files:', files);
      allProducts = files.map(file => {
        const parsed = parseFilename(file.name);
        if (!parsed) return null;
        return {
          id: file.id,
          fileId: file.id,
          filename: file.name,
          product: parsed.product,
          category: parsed.category,
          brand: parsed.brand,
          partNumber: parsed.partNumber,
          coCode: parsed.coCode,
          image: driveImageUrl(file.id)
        };
      }).filter(Boolean);

      if (!files.length) {
        showMessage('No Google Drive images found', 'The Drive API returned no images from the configured folder.');
        return;
      }
      if (!allProducts.length) {
        showMessage('No catalogue products found', 'Images were found, but their filenames do not match Product-C-Category-B-Brand-S-PartNumber-CO-Code.jpg.');
        return;
      }

      populateCategories();
      populateBrands();
      render();
    } catch (error) {
      console.error(error);
      showMessage('Google Drive catalogue could not be loaded', error.message || 'Unknown Google Drive error.');
    }
  }

  search?.addEventListener('input', e => { searchText = e.target.value.trim().toLowerCase(); render(); });
  category?.addEventListener('change', e => { selectedCategory = slug(e.target.value); selectedBrand='all'; populateBrands(); setHeader(); render(); });
  brand?.addEventListener('change', e => { selectedBrand = slug(e.target.value); render(); });
  clear?.addEventListener('click', () => {
    const requested = slug(urlParams().get('category') || 'all') || 'all';
    selectedCategory = requested;
    selectedBrand = 'all';
    searchText = '';
    if (search) search.value='';
    populateCategories();
    populateBrands();
    setHeader();
    render();
  });

  window.chooseBrand = brandName => { location.href = 'category.html?brand=' + encodeURIComponent(brandName); };
  window.chooseCategory = categoryName => { location.href = 'category.html?category=' + encodeURIComponent(categoryName); };

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
