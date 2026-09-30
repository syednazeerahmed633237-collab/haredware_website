/* =========================================================
   LOG HARDWARE - CATALOGUE + FILTER + CART + WHATSAPP
   ========================================================= */

(function () {

    "use strict";

    /* =====================================================
       CONFIGURATION
       ===================================================== */

    // CHANGE THIS TO YOUR REAL WHATSAPP NUMBER
    // India example: 919876543210
    const WHATSAPP_NUMBER = "919XXXXXXXXX";

    const CART_STORAGE_KEY = "logHardwareCart";


    /* =====================================================
       STATE
       ===================================================== */

    let allProducts = [];
    let filteredProducts = [];

    let cart = loadCart();


    /* =====================================================
       HELPERS
       ===================================================== */

    function escapeHtml(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function displayValue(value) {

        if (!value) {
            return "-";
        }

        return String(value)
            .replace(/-/g, " ")
            .replace(/\b\w/g, char => char.toUpperCase());
    }


    function normalizeValue(value) {

        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
    }


    function getProductKey(product) {

        return [
            product.product || "",
            product.category || "",
            product.brand || "",
            product.size || "",
            product.fileId || ""
        ]
            .map(normalizeValue)
            .join("|");
    }


    /* =====================================================
       CART STORAGE
       ===================================================== */

    function loadCart() {

        try {

            const saved =
                localStorage.getItem(CART_STORAGE_KEY);

            if (!saved) {
                return [];
            }

            const parsed =
                JSON.parse(saved);

            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            console.warn(
                "Could not load cart:",
                error
            );

            return [];
        }
    }


    function saveCart() {

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cart)
        );

        updateCartUI();
    }


    function getCartTotalQuantity() {

        return cart.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );
    }


    /* =====================================================
       ADD TO CART
       ===================================================== */

    function addToCart(product) {

        const key =
            getProductKey(product);

        const existing =
            cart.find(
                item =>
                    item.key === key
            );

        if (existing) {

            existing.quantity =
                Number(existing.quantity || 0) + 1;

        } else {

            cart.push({

                key: key,

                product:
                    product.product || "",

                category:
                    product.category || "",

                brand:
                    product.brand || "",

                size:
                    product.size || "",

                image:
                    product.image || "",

                fileId:
                    product.fileId || "",

                filename:
                    product.filename || "",

                quantity: 1

            });
        }

        saveCart();

        openCart();

        showCartMessage(
            `${displayValue(product.product)} added to cart.`
        );
    }


    /* =====================================================
       REMOVE FROM CART
       ===================================================== */

    function removeFromCart(key) {

        cart =
            cart.filter(
                item =>
                    item.key !== key
            );

        saveCart();
    }


    /* =====================================================
       CHANGE QUANTITY
       ===================================================== */

    function changeCartQuantity(
        key,
        amount
    ) {

        const item =
            cart.find(
                product =>
                    product.key === key
            );

        if (!item) {
            return;
        }

        item.quantity =
            Number(item.quantity || 0) +
            Number(amount);

        if (item.quantity <= 0) {

            removeFromCart(key);

            return;
        }

        saveCart();
    }


    /* =====================================================
       CLEAR CART
       ===================================================== */

    function clearCart() {

        if (!cart.length) {
            return;
        }

        cart = [];

        saveCart();

        renderCart();
    }


    /* =====================================================
       CART HEADER
       ===================================================== */

    function createCartButton() {

        if (
            document.getElementById(
                "headerCartButton"
            )
        ) {
            return;
        }

        const container =
            document.querySelector(
                ".topbar-container"
            );

        if (!container) {
            return;
        }

        const button =
            document.createElement("button");

        button.type = "button";

        button.id =
            "headerCartButton";

        button.className =
            "header-cart-button";

        button.setAttribute(
            "aria-label",
            "Open cart"
        );

        button.innerHTML = `
            <span class="cart-icon">🛒</span>
            <span class="cart-label">Cart</span>
            <span id="cartCount" class="cart-count">0</span>
        `;

        button.addEventListener(
            "click",
            openCart
        );

        container.appendChild(button);
    }


    /* =====================================================
       CART DRAWER HTML
       ===================================================== */

    function createCartDrawer() {

        if (
            document.getElementById(
                "cartOverlay"
            )
        ) {
            return;
        }

        const wrapper =
            document.createElement("div");

        wrapper.innerHTML = `

            <div
                id="cartOverlay"
                class="cart-overlay">
            </div>

            <aside
                id="cartDrawer"
                class="cart-drawer"
                aria-label="Shopping cart">

                <div class="cart-header">

                    <div>
                        <span class="cart-eyebrow">
                            YOUR SELECTION
                        </span>

                        <h2>
                            Spare Parts Cart
                        </h2>
                    </div>

                    <button
                        type="button"
                        id="cartCloseButton"
                        class="cart-close-button"
                        aria-label="Close cart">
                        ×
                    </button>

                </div>


                <div
                    id="cartMessage"
                    class="cart-message">
                </div>


                <div
                    id="cartItems"
                    class="cart-items">
                </div>


                <div
                    id="cartEmpty"
                    class="cart-empty">

                    <div class="cart-empty-icon">
                        🛒
                    </div>

                    <h3>
                        Your cart is empty
                    </h3>

                    <p>
                        Add spare parts from the catalogue.
                    </p>

                    <button
                        type="button"
                        id="cartBrowseButton"
                        class="cart-browse-button">
                        Browse Spare Parts
                    </button>

                </div>


                <div
                    id="cartFooter"
                    class="cart-footer">

                    <div class="cart-summary">

                        <span>
                            Total Items
                        </span>

                        <strong
                            id="cartTotalItems">
                            0
                        </strong>

                    </div>


                    <button
                        type="button"
                        id="cartWhatsAppButton"
                        class="cart-whatsapp-button">

                        <span>💬</span>

                        Send Cart on WhatsApp

                    </button>


                    <button
                        type="button"
                        id="cartClearButton"
                        class="cart-clear-button">

                        Clear Cart

                    </button>

                </div>

            </aside>
        `;

        document.body.appendChild(
            wrapper
        );


        document
            .getElementById(
                "cartOverlay"
            )
            .addEventListener(
                "click",
                closeCart
            );


        document
            .getElementById(
                "cartCloseButton"
            )
            .addEventListener(
                "click",
                closeCart
            );


        document
            .getElementById(
                "cartBrowseButton"
            )
            .addEventListener(
                "click",
                () => {

                    closeCart();

                    document
                        .getElementById(
                            "products-section"
                        )
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });

                }
            );


        document
            .getElementById(
                "cartClearButton"
            )
            .addEventListener(
                "click",
                clearCart
            );


        document
            .getElementById(
                "cartWhatsAppButton"
            )
            .addEventListener(
                "click",
                sendCartToWhatsApp
            );
    }


    /* =====================================================
       OPEN CART
       ===================================================== */

    function openCart() {

        const drawer =
            document.getElementById(
                "cartDrawer"
            );

        const overlay =
            document.getElementById(
                "cartOverlay"
            );

        if (!drawer || !overlay) {
            return;
        }

        renderCart();

        drawer.classList.add("is-open");

        overlay.classList.add("is-visible");

        document.body.classList.add(
            "cart-open"
        );
    }


    /* =====================================================
       CLOSE CART
       ===================================================== */

    function closeCart() {

        const drawer =
            document.getElementById(
                "cartDrawer"
            );

        const overlay =
            document.getElementById(
                "cartOverlay"
            );

        if (drawer) {

            drawer.classList.remove(
                "is-open"
            );
        }

        if (overlay) {

            overlay.classList.remove(
                "is-visible"
            );
        }

        document.body.classList.remove(
            "cart-open"
        );
    }


    /* =====================================================
       RENDER CART
       ===================================================== */

    function renderCart() {

        const container =
            document.getElementById(
                "cartItems"
            );

        const empty =
            document.getElementById(
                "cartEmpty"
            );

        const footer =
            document.getElementById(
                "cartFooter"
            );

        const total =
            document.getElementById(
                "cartTotalItems"
            );

        if (!container) {
            return;
        }

        container.innerHTML = "";


        const totalQuantity =
            getCartTotalQuantity();


        if (total) {

            total.textContent =
                totalQuantity;
        }


        if (!cart.length) {

            empty?.classList.add(
                "is-visible"
            );

            footer?.classList.remove(
                "is-visible"
            );

            return;
        }


        empty?.classList.remove(
            "is-visible"
        );

        footer?.classList.add(
            "is-visible"
        );


        cart.forEach(item => {

            const element =
                document.createElement(
                    "article"
                );

            element.className =
                "cart-item";


            element.innerHTML = `

                <div class="cart-item-image">

                    <img
                        src="${escapeHtml(item.image)}"
                        alt="${escapeHtml(
                            displayValue(item.product)
                        )}"
                        loading="lazy"
                        onerror="this.style.display='none';"
                    >

                </div>


                <div class="cart-item-content">

                    <div class="cart-item-title">

                        ${escapeHtml(
                            displayValue(item.product)
                        )}

                    </div>


                    <div class="cart-item-detail">

                        <strong>Brand:</strong>
                        ${escapeHtml(
                            displayValue(item.brand)
                        )}

                    </div>


                    <div class="cart-item-detail">

                        <strong>Category:</strong>
                        ${escapeHtml(
                            displayValue(item.category)
                        )}

                    </div>


                    <div class="cart-item-detail">

                        <strong>Code:</strong>
                        ${escapeHtml(
                            displayValue(item.size)
                        )}

                    </div>


                    <div class="cart-item-controls">

                        <button
                            type="button"
                            class="quantity-button"
                            data-cart-minus="${escapeHtml(item.key)}">
                            −
                        </button>

                        <span class="quantity-value">
                            ${Number(item.quantity || 1)}
                        </span>

                        <button
                            type="button"
                            class="quantity-button"
                            data-cart-plus="${escapeHtml(item.key)}">
                            +
                        </button>

                        <button
                            type="button"
                            class="cart-remove-button"
                            data-cart-remove="${escapeHtml(item.key)}">
                            Remove
                        </button>

                    </div>

                </div>
            `;


            container.appendChild(
                element
            );
        });


        container
            .querySelectorAll(
                "[data-cart-minus]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        changeCartQuantity(
                            button.dataset.cartMinus,
                            -1
                        );

                        renderCart();
                    }
                );
            });


        container
            .querySelectorAll(
                "[data-cart-plus]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        changeCartQuantity(
                            button.dataset.cartPlus,
                            1
                        );

                        renderCart();
                    }
                );
            });


        container
            .querySelectorAll(
                "[data-cart-remove]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        removeFromCart(
                            button.dataset.cartRemove
                        );

                        renderCart();
                    }
                );
            });
    }


    /* =====================================================
       UPDATE CART COUNT
       ===================================================== */

    function updateCartUI() {

        const count =
            document.getElementById(
                "cartCount"
            );

        if (count) {

            count.textContent =
                getCartTotalQuantity();
        }

        renderCart();
    }


    /* =====================================================
       CART MESSAGE
       ===================================================== */

    function showCartMessage(
        message
    ) {

        const element =
            document.getElementById(
                "cartMessage"
            );

        if (!element) {
            return;
        }

        element.textContent =
            message;

        element.classList.add(
            "show"
        );

        setTimeout(
            () => {

                element.classList.remove(
                    "show"
                );

            },
            2200
        );
    }


    /* =====================================================
       PRODUCT CARD
       ===================================================== */

    function renderProductCard(
        product
    ) {

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "product-card";


        const productName =
            displayValue(
                product.product
            );

        const category =
            displayValue(
                product.category
            );

        const brand =
            displayValue(
                product.brand
            );

        const code =
            product.size || "-";


        card.innerHTML = `

            <div class="product-image-wrap">

                <img
                    class="product-image"
                    src="${escapeHtml(product.image || "")}"
                    alt="${escapeHtml(productName)}"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
                                <rect width="100%" height="100%" fill="#f3eee7"/>
                                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#8b7355" font-size="22">
                                    Image unavailable
                                </text>
                            </svg>
                        `)}';
                    "
                >

            </div>


            <div class="product-card-body">

                <h3 class="product-title">
                    ${escapeHtml(productName)}
                </h3>


                <div class="product-info-list">

                    <div class="product-info-row">
                        <span>Brand</span>
                        <strong>
                            ${escapeHtml(brand)}
                        </strong>
                    </div>


                    <div class="product-info-row">
                        <span>Category</span>
                        <strong>
                            ${escapeHtml(category)}
                        </strong>
                    </div>


                    <div class="product-info-row">
                        <span>Code</span>
                        <strong>
                            ${escapeHtml(code)}
                        </strong>
                    </div>

                </div>


                <div class="product-actions">

                    <button
                        type="button"
                        class="add-cart-button">

                        🛒 Add to Cart

                    </button>


                    <button
                        type="button"
                        class="product-whatsapp-button">

                        💬 WhatsApp

                    </button>

                </div>

            </div>
        `;


        card
            .querySelector(
                ".add-cart-button"
            )
            .addEventListener(
                "click",
                () => {

                    addToCart(product);

                }
            );


        card
            .querySelector(
                ".product-whatsapp-button"
            )
            .addEventListener(
                "click",
                () => {

                    sendSingleProductToWhatsApp(
                        product
                    );

                }
            );


        return card;
    }


    /* =====================================================
       RENDER PRODUCTS
       ===================================================== */

    function renderProducts(
        products
    ) {

        const grid =
            document.getElementById(
                "productGrid"
            );

        if (!grid) {
            return;
        }

        grid.innerHTML = "";


        if (!products.length) {

            grid.innerHTML = `

                <div class="catalogue-empty">

                    <div class="catalogue-empty-icon">
                        🔍
                    </div>

                    <h3>
                        No spare parts found
                    </h3>

                    <p>
                        Try another search, category or brand.
                    </p>

                </div>
            `;

            updateProductCount(0);

            return;
        }


        const fragment =
            document.createDocumentFragment();


        products.forEach(
            product => {

                fragment.appendChild(
                    renderProductCard(
                        product
                    )
                );

            }
        );


        grid.appendChild(
            fragment
        );


        updateProductCount(
            products.length
        );
    }


    /* =====================================================
       PRODUCT COUNT
       ===================================================== */

    function updateProductCount(
        count
    ) {

        const element =
            document.getElementById(
                "productCount"
            );

        if (!element) {
            return;
        }

        element.textContent =
            `${count} product${count === 1 ? "" : "s"}`;
    }


    /* =====================================================
       FILTER DROPDOWNS
       ===================================================== */

    function populateFilters(
        products
    ) {

        const categorySelect =
            document.getElementById(
                "categoryFilter"
            );

        const brandSelect =
            document.getElementById(
                "brandFilter"
            );


        if (!categorySelect ||
            !brandSelect) {

            return;
        }


        const categories =
            [...new Set(
                products
                    .map(
                        product =>
                            displayValue(
                                product.category
                            )
                    )
                    .filter(Boolean)
            )]
                .sort();


        const brands =
            [...new Set(
                products
                    .map(
                        product =>
                            displayValue(
                                product.brand
                            )
                    )
                    .filter(Boolean)
            )]
                .sort();


        categorySelect.innerHTML =
            `<option value="All">All Categories</option>`;


        brandSelect.innerHTML =
            `<option value="All">All Brands</option>`;


        categories.forEach(
            category => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    category;

                option.textContent =
                    category;

                categorySelect.appendChild(
                    option
                );
            }
        );


        brands.forEach(
            brand => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    brand;

                option.textContent =
                    brand;

                brandSelect.appendChild(
                    option
                );
            }
        );
    }


    /* =====================================================
       FILTER PRODUCTS
       ===================================================== */

    function applyFilters() {

        const search =
            (
                document.getElementById(
                    "searchFilter"
                )?.value || ""
            )
                .trim()
                .toLowerCase();


        const category =
            document.getElementById(
                "categoryFilter"
            )?.value || "All";


        const brand =
            document.getElementById(
                "brandFilter"
            )?.value || "All";


        filteredProducts =
            allProducts.filter(
                product => {

                    const searchable = [

                        product.product,

                        product.category,

                        product.brand,

                        product.size,

                        product.filename

                    ]
                        .join(" ")
                        .toLowerCase();


                    const searchMatch =
                        !search ||
                        searchable.includes(
                            search
                        );


                    const categoryMatch =
                        category === "All" ||
                        displayValue(
                            product.category
                        ) === category;


                    const brandMatch =
                        brand === "All" ||
                        displayValue(
                            product.brand
                        ) === brand;


                    return (
                        searchMatch &&
                        categoryMatch &&
                        brandMatch
                    );
                }
            );


        renderProducts(
            filteredProducts
        );
    }


    /* =====================================================
       CATEGORY
       ===================================================== */

    window.chooseCategory =
        function (category) {

            const select =
                document.getElementById(
                    "categoryFilter"
                );

            if (select) {

                const options =
                    [...select.options];

                const matching =
                    options.find(
                        option =>
                            normalizeValue(
                                option.value
                            ) ===
                            normalizeValue(
                                category
                            )
                    );

                if (matching) {

                    select.value =
                        matching.value;
                }
            }

            applyFilters();

            document
                .getElementById(
                    "products-section"
                )
                ?.scrollIntoView({
                    behavior: "smooth"
                });
        };


    /* =====================================================
       BRAND
       ===================================================== */

    window.chooseBrand =
        function (brand) {

            const select =
                document.getElementById(
                    "brandFilter"
                );

            if (select) {

                const options =
                    [...select.options];

                const matching =
                    options.find(
                        option =>
                            normalizeValue(
                                option.value
                            ) ===
                            normalizeValue(
                                brand
                            )
                    );

                if (matching) {

                    select.value =
                        matching.value;
                }
            }

            applyFilters();

            document
                .getElementById(
                    "products-section"
                )
                ?.scrollIntoView({
                    behavior: "smooth"
                });
        };


    /* =====================================================
       SINGLE PRODUCT WHATSAPP
       ===================================================== */

    function sendSingleProductToWhatsApp(
        product
    ) {

        const productName =
            displayValue(
                product.product
            );

        const category =
            displayValue(
                product.category
            );

        const brand =
            displayValue(
                product.brand
            );

        const code =
            product.size || "-";


        const message =

`Hello LOG HARDWARE,

I am interested in this spare part.

PRODUCT: ${productName}
BRAND: ${brand}
CATEGORY: ${category}
CODE: ${code}

PRODUCT IMAGE:
${product.image || "Image URL unavailable"}

Please confirm availability and price.

Thank you.`;


        openWhatsApp(
            message
        );
    }


    /* =====================================================
       CART WHATSAPP
       ===================================================== */

    function sendCartToWhatsApp() {

        if (!cart.length) {

            showCartMessage(
                "Your cart is empty."
            );

            return;
        }


        let message =

`Hello LOG HARDWARE,

I would like to enquire about the following spare parts:

`;


        cart.forEach(
            (item, index) => {

                message += `

${index + 1}. ${displayValue(item.product)}

Brand: ${displayValue(item.brand)}
Category: ${displayValue(item.category)}
Code: ${item.size || "-"}
Quantity: ${item.quantity}

Product Image:
${item.image || "Image URL unavailable"}

------------------------------`;
            }
        );


        message += `

Please confirm availability and price for all the above items.

Thank you.`;


        openWhatsApp(
            message
        );
    }


    /* =====================================================
       OPEN WHATSAPP
       ===================================================== */

    function openWhatsApp(
        message
    ) {

        const number =
            String(
                WHATSAPP_NUMBER
            )
                .replace(/\D/g, "");


        if (
            !number ||
            number === "919XXXXXXXXX"
        ) {

            alert(
                "Please set your WhatsApp number in catalogue.js first."
            );

            return;
        }


        const url =
            "https://wa.me/" +
            number +
            "?text=" +
            encodeURIComponent(
                message
            );


        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );
    }


    /* =====================================================
       STORE WHATSAPP
       ===================================================== */

    window.openStoreWhatsApp =
        function () {

            const message =
`Hello LOG HARDWARE,

I need help finding a spare part.

Please assist me with availability and price.

Thank you.`;


            openWhatsApp(
                message
            );
        };


    /* =====================================================
       LOAD GOOGLE DRIVE CATALOGUE
       ===================================================== */

    async function loadCatalogue() {

        const grid =
            document.getElementById(
                "productGrid"
            );


        if (!grid) {
            return;
        }


        grid.innerHTML = `

            <div class="catalogue-loading">

                <div class="loading-spinner"></div>

                <h3>
                    Loading spare parts...
                </h3>

                <p>
                    Reading the live Google Drive catalogue.
                </p>

            </div>
        `;


        try {

            if (
                !window.GoogleDriveConnector ||
                typeof
                    window.GoogleDriveConnector
                        .getGoogleDriveImages !==
                    "function"
            ) {

                throw new Error(
                    "Google Drive connector is not loaded."
                );
            }


            const files =
                await
                window.GoogleDriveConnector
                    .getGoogleDriveImages();


            const index =
                window.GoogleDriveConnector
                    .buildGoogleDriveImageIndex(
                        files
                    );


            const products = [];


            Object.keys(index)
                .forEach(
                    productKey => {

                        const images =
                            index[
                                productKey
                            ] || [];


                        images.forEach(
                            image => {

                                products.push({

                                    product:
                                        image.product,

                                    category:
                                        image.category,

                                    brand:
                                        image.brand,

                                    size:
                                        image.size,

                                    image:
                                        image.image,

                                    fileId:
                                        image.fileId,

                                    filename:
                                        image.filename,

                                    mimeType:
                                        image.mimeType,

                                    modifiedTime:
                                        image.modifiedTime
                                });
                            }
                        );
                    }
                );


            allProducts =
                products;


            filteredProducts =
                [...allProducts];


            populateFilters(
                allProducts
            );


            renderProducts(
                filteredProducts
            );


        } catch (error) {

            console.error(
                "Catalogue loading error:",
                error
            );


            grid.innerHTML = `

                <div class="catalogue-empty">

                    <div class="catalogue-empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Catalogue could not be loaded
                    </h3>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Please try again."
                        )}
                    </p>

                </div>
            `;

            updateProductCount(0);
        }
    }


    /* =====================================================
       FILTER EVENTS
       ===================================================== */

    function setupFilters() {

        const search =
            document.getElementById(
                "searchFilter"
            );

        const category =
            document.getElementById(
                "categoryFilter"
            );

        const brand =
            document.getElementById(
                "brandFilter"
            );

        const clear =
            document.getElementById(
                "clearFilters"
            );


        search?.addEventListener(
            "input",
            applyFilters
        );


        category?.addEventListener(
            "change",
            applyFilters
        );


        brand?.addEventListener(
            "change",
            applyFilters
        );


        clear?.addEventListener(
            "click",
            () => {

                if (search) {
                    search.value = "";
                }

                if (category) {
                    category.value = "All";
                }

                if (brand) {
                    brand.value = "All";
                }

                applyFilters();
            }
        );
    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    async function initializeCatalogue() {

        createCartButton();

        createCartDrawer();

        setupFilters();

        updateCartUI();

        await loadCatalogue();
    }


    /* =====================================================
       START
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeCatalogue
        );

    } else {

        initializeCatalogue();
    }


})();
