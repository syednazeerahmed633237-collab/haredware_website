/* =========================================================
   LOG HARDWARE - CATALOGUE / FILTER SYSTEM

   IMPORTANT:
   - This file is only for index.html.
   - DO NOT replace app.js.
   - Upload functionality remains unchanged.
   - Products are loaded from the existing Google Drive connector.
   ========================================================= */

(() => {
    "use strict";

    const state = {
        products: [],
        filteredProducts: [],
        search: "",
        category: "All",
        brand: "All"
    };

    const elements = {};

    /* ======================================================
       INITIALIZE ELEMENTS
       ====================================================== */

    function initElements() {

        elements.search =
            document.getElementById("searchFilter");

        elements.category =
            document.getElementById("categoryFilter");

        elements.brand =
            document.getElementById("brandFilter");

        elements.clear =
            document.getElementById("clearFilters");

        elements.grid =
            document.getElementById("productGrid");

        elements.count =
            document.getElementById("productCount");
    }


    /* ======================================================
       HTML ESCAPE
       ====================================================== */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* ======================================================
       NORMALIZE
       ====================================================== */

    function normalize(value) {

        return String(value ?? "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");
    }


    /* ======================================================
       HUMAN READABLE TEXT
       ====================================================== */

    function humanize(value) {

        return String(value ?? "")
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b\w/g, char => char.toUpperCase());
    }


    /* ======================================================
       BRAND DISPLAY
       ====================================================== */

    function formatBrand(value) {

        const key = normalize(value);

        const brands = {

            "lg": "LG",

            "samsung": "Samsung",

            "daikin": "Daikin",

            "voltas": "Voltas",

            "whirlpool": "Whirlpool",

            "carrier": "Carrier",

            "crompton": "Crompton",

            "schneider": "Schneider",

            "honeywell": "Honeywell",

            "taparia": "Taparia",

            "kent": "Kent",

            "supreme": "Supreme",

            "mandev": "Mandev",

            "3m": "3M",

            "godrej": "Godrej",

            "ifb": "IFB",

            "haier": "Haier",

            "panasonic": "Panasonic",

            "hitachi": "Hitachi",

            "bosch": "Bosch"

        };

        return brands[key] || humanize(value);
    }


    /* ======================================================
       CATEGORY DISPLAY
       ====================================================== */

    function formatCategory(value) {

        const key = normalize(value);

        const categories = {

            "general-tools": "General Tools",

            "washing-machine": "Washing Machine",

            "refrigerator": "Refrigerator",

            "water-purifier": "Water Purifier",

            "microwave": "Microwave",

            "air-conditioner": "Air Conditioner",

            "ac-parts": "AC Parts",

            "television": "Television",

            "kitchen-appliance": "Kitchen Appliance",

            "general-tool": "General Tool",

            "spare-parts": "Spare Parts",

            "accessories": "Accessories",

            "other": "Other"

        };

        return categories[key] || humanize(value);
    }


    /* ======================================================
       PRODUCT NAME
       ====================================================== */

    function getDisplayProductName(product) {

        if (product.displayProduct) {
            return product.displayProduct;
        }

        return humanize(product.product);
    }


    /* ======================================================
       SEARCH TEXT
       ====================================================== */

    function getProductSearchText(product) {

        return [

            product.product,

            product.displayProduct,

            product.category,

            product.displayCategory,

            product.brand,

            product.displayBrand,

            product.partNumber,

            product.size,

            product.coCode,

            product.filename

        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
    }


    /* ======================================================
       CREATE PRODUCT FROM DRIVE FILE
       ====================================================== */

    function buildProductFromDriveFile(file) {

        if (!file || !file.id || !file.name) {
            return null;
        }

        const connector =
            window.GoogleDriveConnector;

        if (!connector) {

            console.error(
                "GoogleDriveConnector is not available."
            );

            return null;
        }

        const parsed =
            connector.parseGoogleDriveFilename(file.name);

        /*
         * If the filename does not follow:
         *
         * PRODUCT-C-CATEGORY-B-BRAND-S-PARTNUMBER-CO-CODE.jpg
         *
         * then it cannot be used as a catalogue product.
         */

        if (!parsed) {

            console.warn(
                "Invalid product filename:",
                file.name
            );

            return null;
        }


        /*
         * Use the existing Google Drive thumbnail
         * URL logic.
         */

        const image =
            `https://drive.google.com/thumbnail?id=${encodeURIComponent(file.id)}&sz=w1600`;


        return {

            fileId: file.id,

            filename: file.name,

            image: image,

            product: parsed.product,

            displayProduct:
                humanize(parsed.product),

            category:
                parsed.category,

            displayCategory:
                formatCategory(parsed.category),

            brand:
                parsed.brand,

            displayBrand:
                formatBrand(parsed.brand),

            size:
                parsed.size || parsed.partNumber || "",

            partNumber:
                parsed.partNumber || parsed.size || "",

            coCode:
                parsed.coCode || "",

            mimeType:
                file.mimeType || "",

            modifiedTime:
                file.modifiedTime || ""

        };
    }


    /* ======================================================
       LOAD GOOGLE DRIVE CATALOGUE
       ====================================================== */

    async function loadCatalogue() {

        showLoading();

        try {

            if (!window.GoogleDriveConnector) {

                throw new Error(
                    "Google Drive connector is not loaded."
                );
            }


            /*
             * This uses the EXISTING Google Drive
             * connection code.
             *
             * Nothing related to upload is changed.
             */

            const files =
                await window.GoogleDriveConnector
                    .getGoogleDriveImages();


            console.log(
                "Google Drive files received:",
                files
            );


            const products =
                files
                    .map(buildProductFromDriveFile)
                    .filter(Boolean);


            state.products =
                products;

            state.filteredProducts =
                [...products];


            populateFilterOptions(products);

            applyFilters();


            console.log(
                `LOG HARDWARE catalogue loaded: ${products.length} products.`
            );

        }

        catch (error) {

            console.error(
                "Catalogue loading failed:",
                error
            );

            state.products = [];

            state.filteredProducts = [];

            showError(
                error.message ||
                "Unable to load Google Drive catalogue."
            );
        }
    }


    /* ======================================================
       POPULATE CATEGORY + BRAND FILTERS
       ====================================================== */

    function populateFilterOptions(products) {

        if (!elements.category ||
            !elements.brand) {

            return;
        }


        const categories =
            new Map();

        const brands =
            new Map();


        products.forEach(product => {

            const categoryKey =
                normalize(product.category);

            const brandKey =
                normalize(product.brand);


            if (categoryKey) {

                categories.set(
                    categoryKey,
                    product.displayCategory
                );
            }


            if (brandKey) {

                brands.set(
                    brandKey,
                    product.displayBrand
                );
            }

        });


        /*
         * Category
         */

        elements.category.innerHTML =
            '<option value="All">All Categories</option>';


        [...categories.entries()]
            .sort((a, b) =>
                a[1].localeCompare(b[1])
            )
            .forEach(([value, label]) => {

                const option =
                    document.createElement("option");

                option.value =
                    value;

                option.textContent =
                    label;

                elements.category.appendChild(
                    option
                );
            });


        /*
         * Brand
         */

        elements.brand.innerHTML =
            '<option value="All">All Brands</option>';


        [...brands.entries()]
            .sort((a, b) =>
                a[1].localeCompare(b[1])
            )
            .forEach(([value, label]) => {

                const option =
                    document.createElement("option");

                option.value =
                    value;

                option.textContent =
                    label;

                elements.brand.appendChild(
                    option
                );
            });


        elements.category.value =
            state.category;

        elements.brand.value =
            state.brand;
    }


    /* ======================================================
       APPLY FILTERS
       ====================================================== */

    function applyFilters() {

        const search =
            state.search
                .trim()
                .toLowerCase();


        const category =
            normalize(state.category);


        const brand =
            normalize(state.brand);


        state.filteredProducts =
            state.products.filter(product => {

                const matchesSearch =
                    !search ||
                    getProductSearchText(product)
                        .includes(search);


                const matchesCategory =
                    state.category === "All" ||
                    normalize(product.category) === category;


                const matchesBrand =
                    state.brand === "All" ||
                    normalize(product.brand) === brand;


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesBrand
                );

            });


        renderProducts();
    }


    /* ======================================================
       RENDER PRODUCTS
       ====================================================== */

    function renderProducts() {

        if (!elements.grid) {
            return;
        }


        elements.grid.innerHTML = "";


        const total =
            state.filteredProducts.length;


        const overall =
            state.products.length;


        /*
         * Dynamic product count
         */

        if (elements.count) {

            elements.count.textContent =
                `${total} ${
                    total === 1
                        ? "product"
                        : "products"
                }`;
        }


        /*
         * No products
         */

        if (!total) {

            const panel =
                document.createElement("div");

            panel.className =
                "no-results-panel";


            panel.innerHTML = `

                <div class="no-results-icon">
                    🔎
                </div>

                <h3>
                    No spare parts found
                </h3>

                <p>
                    ${
                        overall
                            ? "Try another search, category, or brand."
                            : "No valid product images were found in the Google Drive folder."
                    }
                </p>

                ${
                    overall
                        ? `
                            <button
                                type="button"
                                class="filter-clear-btn no-results-clear">
                                Clear Filters
                            </button>
                          `
                        : ""
                }

            `;


            elements.grid.appendChild(
                panel
            );


            const clearButton =
                panel.querySelector(
                    ".no-results-clear"
                );


            if (clearButton) {

                clearButton.addEventListener(
                    "click",
                    clearFilters
                );
            }


            return;
        }


        /*
         * Create cards
         */

        const fragment =
            document.createDocumentFragment();


        state.filteredProducts.forEach(
            product => {

                fragment.appendChild(
                    createProductCard(product)
                );

            }
        );


        elements.grid.appendChild(
            fragment
        );
    }


    /* ======================================================
       PRODUCT CARD
       ====================================================== */

    function createProductCard(product) {

        const card =
            document.createElement("article");


        card.className =
            "product-card";


        const productName =
            getDisplayProductName(product);


        const category =
            product.displayCategory ||
            formatCategory(product.category);


        const brand =
            product.displayBrand ||
            formatBrand(product.brand);


        const partNumber =
            product.partNumber ||
            product.size ||
            "";


        const coCode =
            product.coCode ||
            "";


        card.innerHTML = `

            <div class="image-wrap">

                <img
                    src="${escapeHtml(product.image)}"
                    alt="${escapeHtml(productName)}"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                >

                <span class="card-tag">
                    ${escapeHtml(category)}
                </span>

            </div>


            <div class="card-copy">

                <h3 class="product-title">
                    ${escapeHtml(productName)}
                </h3>


                <p class="card-brand-meta">

                    <span class="meta-brand">
                        ${escapeHtml(brand)}
                    </span>

                    ${
                        partNumber
                            ? `
                                <span class="meta-separator">
                                    •
                                </span>

                                <span class="meta-sku">
                                    ${escapeHtml(partNumber)}
                                </span>
                              `
                            : ""
                    }

                </p>


                ${
                    coCode
                        ? `
                            <p class="card-brand-meta">

                                <span class="meta-sku">
                                    CO Code:
                                    ${escapeHtml(coCode)}
                                </span>

                            </p>
                          `
                        : ""
                }

            </div>

        `;


        /*
         * Image fallback
         */

        const image =
            card.querySelector("img");


        image.addEventListener(
            "error",
            () => {

                if (
                    image.dataset.fallbackApplied === "1"
                ) {
                    return;
                }


                image.dataset.fallbackApplied =
                    "1";


                image.src =
                    `https://drive.google.com/thumbnail?id=${encodeURIComponent(
                        product.fileId
                    )}&sz=w1000`;

            }
        );


        return card;
    }


    /* ======================================================
       LOADING STATE
       ====================================================== */

    function showLoading() {

        if (!elements.grid) {
            return;
        }


        elements.grid.innerHTML = `

            <div class="no-results-panel">

                <div class="no-results-icon">
                    ⏳
                </div>

                <h3>
                    Loading spare parts...
                </h3>

                <p>
                    Reading product images and details
                    from Google Drive.
                </p>

            </div>

        `;


        if (elements.count) {

            elements.count.textContent =
                "Loading...";
        }
    }


    /* ======================================================
       ERROR STATE
       ====================================================== */

    function showError(message) {

        if (!elements.grid) {
            return;
        }


        elements.grid.innerHTML = `

            <div class="no-results-panel">

                <div class="no-results-icon">
                    ⚠️
                </div>

                <h3>
                    Catalogue could not be loaded
                </h3>

                <p>
                    ${escapeHtml(message)}
                </p>

            </div>

        `;


        if (elements.count) {

            elements.count.textContent =
                "0 products";
        }
    }


    /* ======================================================
       CLEAR FILTERS
       ====================================================== */

    function clearFilters() {

        state.search =
            "";

        state.category =
            "All";

        state.brand =
            "All";


        if (elements.search) {
            elements.search.value =
                "";
        }


        if (elements.category) {
            elements.category.value =
                "All";
        }


        if (elements.brand) {
            elements.brand.value =
                "All";
        }


        /*
         * Remove category card selection
         */

        document
            .querySelectorAll(
                ".category-card.selected"
            )
            .forEach(card => {

                card.classList.remove(
                    "selected"
                );

            });


        applyFilters();
    }


    /* ======================================================
       CATEGORY CARD
       ====================================================== */

    function chooseCategory(category) {

        const wanted =
            normalize(category);


        if (elements.category) {

            const option =
                [...elements.category.options]
                    .find(item =>
                        normalize(item.value) === wanted ||
                        normalize(item.textContent) === wanted
                    );


            if (option) {

                state.category =
                    option.value;

                elements.category.value =
                    option.value;
            }
        }


        /*
         * Clear text search when selecting
         * a category card.
         */

        state.search =
            "";


        if (elements.search) {

            elements.search.value =
                "";
        }


        /*
         * Highlight selected category.
         */

        document
            .querySelectorAll(".category-card")
            .forEach(card => {

                card.classList.toggle(
                    "selected",
                    normalize(card.dataset.category) === wanted
                );

            });


        applyFilters();


        /*
         * Scroll to product section.
         */

        document
            .getElementById("products-section")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    }


    /* ======================================================
       BRAND PILL
       ====================================================== */

    function chooseBrand(brand) {

        const wanted =
            normalize(brand);


        if (elements.brand) {

            const option =
                [...elements.brand.options]
                    .find(item =>
                        normalize(item.value) === wanted ||
                        normalize(item.textContent) === wanted
                    );


            if (option) {

                state.brand =
                    option.value;

                elements.brand.value =
                    option.value;
            }
        }


        /*
         * Clear text search.
         */

        state.search =
            "";


        if (elements.search) {

            elements.search.value =
                "";
        }


        /*
         * Remove category highlight.
         */

        document
            .querySelectorAll(
                ".category-card.selected"
            )
            .forEach(card => {

                card.classList.remove(
                    "selected"
                );

            });


        applyFilters();


        document
            .getElementById("products-section")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    }


    /* ======================================================
       EVENTS
       ====================================================== */

    function bindEvents() {

        /*
         * Search
         */

        if (elements.search) {

            elements.search.addEventListener(
                "input",
                event => {

                    state.search =
                        event.target.value;

                    applyFilters();

                }
            );
        }


        /*
         * Category
         */

        if (elements.category) {

            elements.category.addEventListener(
                "change",
                event => {

                    state.category =
                        event.target.value;


                    document
                        .querySelectorAll(
                            ".category-card"
                        )
                        .forEach(card => {

                            card.classList.toggle(
                                "selected",
                                normalize(
                                    card.dataset.category
                                ) ===
                                normalize(
                                    state.category
                                )
                            );

                        });


                    applyFilters();

                }
            );
        }


        /*
         * Brand
         */

        if (elements.brand) {

            elements.brand.addEventListener(
                "change",
                event => {

                    state.brand =
                        event.target.value;

                    applyFilters();

                }
            );
        }


        /*
         * Clear filters
         */

        if (elements.clear) {

            elements.clear.addEventListener(
                "click",
                clearFilters
            );
        }
    }


    /* ======================================================
       INITIALIZE
       ====================================================== */

    function init() {

        initElements();

        bindEvents();

        loadCatalogue();
    }


    /*
     * Make these functions available to the
     * existing onclick attributes in index.html.
     */

    window.chooseCategory =
        chooseCategory;

    window.chooseBrand =
        chooseBrand;

    window.clearCatalogueFilters =
        clearFilters;


    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );

    } else {

        init();

    }

})();
