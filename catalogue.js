/*
==========================================================
LOG HARDWARE - GOOGLE DRIVE CATALOGUE
==========================================================

This file:
- Reads product images from Google Drive
- Reads the selected category from the URL
- Shows ONLY that category
- Supports search
- Supports brand filter
- Supports category filter
- Renders Google Drive images
- Shows useful errors instead of silently failing

URL example:
category.html?category=Washing%20Machine
==========================================================
*/

(function () {
    "use strict";

    /* =====================================================
       GLOBAL STATE
    ===================================================== */

    let allProducts = [];
    let filteredProducts = [];

    let selectedCategory = "All";
    let selectedBrand = "All";
    let searchText = "";

    /* =====================================================
       DOM
    ===================================================== */

    const productGrid =
        document.getElementById("productGrid");

    const productCount =
        document.getElementById("productCount");

    const searchFilter =
        document.getElementById("searchFilter");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const brandFilter =
        document.getElementById("brandFilter");

    const clearFilters =
        document.getElementById("clearFilters");

    const categoryPageTitle =
        document.getElementById("categoryPageTitle");

    const categoryPageDescription =
        document.getElementById("categoryPageDescription");

    const categoryNote =
        document.getElementById("categoryNote");


    /* =====================================================
       HELPERS
    ===================================================== */

    function normalize(value) {

        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ");
    }


    function displayName(value) {

        return String(value || "")
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b\w/g, function (letter) {
                return letter.toUpperCase();
            });
    }


    function escapeHtml(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function getUrlCategory() {

        const params =
            new URLSearchParams(window.location.search);

        return params.get("category") || "All";
    }


    /* =====================================================
       PAGE TITLE
    ===================================================== */

    function updatePageHeader() {

        if (selectedCategory === "All") {

            if (categoryPageTitle) {
                categoryPageTitle.textContent =
                    "Spare Parts";
            }

            if (categoryPageDescription) {
                categoryPageDescription.textContent =
                    "Browse available appliance and hardware spare parts.";
            }

            if (categoryNote) {
                categoryNote.textContent =
                    "all categories";
            }

            return;
        }


        const readableCategory =
            displayName(selectedCategory);


        if (categoryPageTitle) {

            categoryPageTitle.textContent =
                readableCategory + " Spare Parts";
        }


        if (categoryPageDescription) {

            categoryPageDescription.textContent =
                "Browse genuine " +
                readableCategory +
                " spare parts available from LOG HARDWARE.";
        }


        if (categoryNote) {

            categoryNote.textContent =
                readableCategory;
        }


        document.title =
            readableCategory +
            " Spare Parts | LOG HARDWARE";
    }


    /* =====================================================
       CREATE PRODUCTS FROM GOOGLE DRIVE FILES
    ===================================================== */

    function createProductsFromDriveFiles(files) {

        const products = [];


        if (!Array.isArray(files)) {
            return products;
        }


        files.forEach(function (file) {

            if (!file || !file.name || !file.id) {
                return;
            }


            const parsed =
                window.GoogleDriveConnector
                    .parseGoogleDriveFilename(file.name);


            if (!parsed) {

                console.warn(
                    "Skipped file with invalid filename:",
                    file.name
                );

                return;
            }


            products.push({

                id:
                    parsed.product +
                    "-" +
                    parsed.category +
                    "-" +
                    parsed.brand +
                    "-" +
                    parsed.partNumber +
                    "-" +
                    parsed.coCode,

                product:
                    parsed.product,

                category:
                    parsed.category,

                brand:
                    parsed.brand,

                partNumber:
                    parsed.partNumber,

                coCode:
                    parsed.coCode,

                size:
                    parsed.partNumber,

                filename:
                    file.name,

                fileId:
                    file.id,

                image:
                    window.GoogleDriveConnector
                        .getGoogleDriveImageUrl(file.id),

                mimeType:
                    file.mimeType || "",

                modifiedTime:
                    file.modifiedTime || ""

            });

        });


        return products;
    }


    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    function applyInitialCategory() {

        const urlCategory =
            getUrlCategory();


        if (
            urlCategory &&
            urlCategory !== "All"
        ) {

            selectedCategory =
                normalize(urlCategory);

        } else {

            selectedCategory =
                "All";
        }


        updatePageHeader();
    }


    /* =====================================================
       BUILD CATEGORY DROPDOWN
    ===================================================== */

    function populateCategoryFilter() {

        if (!categoryFilter) {
            return;
        }


        const categories = [];


        allProducts.forEach(function (product) {

            const category =
                normalize(product.category);


            if (
                category &&
                !categories.includes(category)
            ) {

                categories.push(category);
            }

        });


        categories.sort();


        categoryFilter.innerHTML =
            '<option value="All">All Categories</option>';


        categories.forEach(function (category) {

            const option =
                document.createElement("option");

            option.value =
                category;

            option.textContent =
                displayName(category);

            categoryFilter.appendChild(option);

        });


        if (selectedCategory !== "All") {

            const exists =
                categories.includes(
                    selectedCategory
                );


            if (exists) {

                categoryFilter.value =
                    selectedCategory;
            }

        }

    }


    /* =====================================================
       BUILD BRAND DROPDOWN
    ===================================================== */

    function populateBrandFilter() {

        if (!brandFilter) {
            return;
        }


        const brands = [];


        allProducts.forEach(function (product) {

            const productCategory =
                normalize(product.category);


            /*
             * When a category is selected,
             * only show brands belonging to
             * that category.
             */

            if (
                selectedCategory !== "All" &&
                productCategory !== selectedCategory
            ) {

                return;
            }


            const brand =
                normalize(product.brand);


            if (
                brand &&
                !brands.includes(brand)
            ) {

                brands.push(brand);
            }

        });


        brands.sort();


        brandFilter.innerHTML =
            '<option value="All">All Brands</option>';


        brands.forEach(function (brand) {

            const option =
                document.createElement("option");

            option.value =
                brand;

            option.textContent =
                displayName(brand);

            brandFilter.appendChild(option);

        });


        if (
            selectedBrand !== "All" &&
            brands.includes(selectedBrand)
        ) {

            brandFilter.value =
                selectedBrand;

        } else {

            selectedBrand =
                "All";

            brandFilter.value =
                "All";
        }

    }


    /* =====================================================
       FILTER PRODUCTS
    ===================================================== */

    function filterProducts() {

        filteredProducts =
            allProducts.filter(function (product) {

                const productCategory =
                    normalize(product.category);

                const productBrand =
                    normalize(product.brand);

                const searchHaystack =
                    [
                        product.product,
                        product.category,
                        product.brand,
                        product.partNumber,
                        product.coCode,
                        product.filename
                    ]
                    .join(" ")
                    .toLowerCase();


                /*
                 * CATEGORY
                 */

                if (
                    selectedCategory !== "All" &&
                    productCategory !== selectedCategory
                ) {

                    return false;
                }


                /*
                 * BRAND
                 */

                if (
                    selectedBrand !== "All" &&
                    productBrand !== selectedBrand
                ) {

                    return false;
                }


                /*
                 * SEARCH
                 */

                if (
                    searchText &&
                    !searchHaystack.includes(searchText)
                ) {

                    return false;
                }


                return true;

            });


        renderProducts();
    }


    /* =====================================================
       PRODUCT CARD
    ===================================================== */

    function createProductCard(product, index) {

        const card =
            document.createElement("article");

        card.className =
            "product-card";


        const imageWrap =
            document.createElement("div");

        imageWrap.className =
            "image-wrap";


        const image =
            document.createElement("img");

        image.src =
            product.image;

        image.alt =
            displayName(product.product);


        image.loading =
            "lazy";


        image.onerror =
            function () {

                imageWrap.innerHTML = `
                    <div style="
                        padding:30px;
                        text-align:center;
                        color:#8b8178;
                        font-size:13px;
                    ">
                        Image unavailable
                    </div>
                `;

            };


        imageWrap.appendChild(image);


        const tag =
            document.createElement("span");

        tag.className =
            "card-tag";

        tag.textContent =
            displayName(product.category);


        imageWrap.appendChild(tag);


        const body =
            document.createElement("div");

        body.className =
            "product-card-body";


        const title =
            document.createElement("h3");

        title.className =
            "product-title";

        title.textContent =
            displayName(product.product);


        const info =
            document.createElement("div");

        info.className =
            "product-info-list";


        info.innerHTML = `

            <div class="product-info-row">
                <span>Category</span>
                <strong>
                    ${escapeHtml(
                        displayName(product.category)
                    )}
                </strong>
            </div>

            <div class="product-info-row">
                <span>Brand</span>
                <strong>
                    ${escapeHtml(
                        displayName(product.brand)
                    )}
                </strong>
            </div>

            <div class="product-info-row">
                <span>Part Number</span>
                <strong>
                    ${escapeHtml(
                        product.partNumber
                    )}
                </strong>
            </div>

            <div class="product-info-row">
                <span>CO Code</span>
                <strong>
                    ${escapeHtml(
                        product.coCode
                    )}
                </strong>
            </div>

        `;


        const actions =
            document.createElement("div");

        actions.className =
            "product-actions";


        /*
         * WhatsApp
         */

        const whatsapp =
            document.createElement("button");

        whatsapp.type =
            "button";

        whatsapp.className =
            "product-whatsapp-button";

        whatsapp.textContent =
            "💬 Enquire";


        whatsapp.addEventListener(
            "click",
            function () {

                const message =
                    "Hello LOG HARDWARE,%0A%0A" +
                    "I need this spare part:%0A" +
                    "Product: " +
                    encodeURIComponent(
                        displayName(product.product)
                    ) +
                    "%0A" +
                    "Category: " +
                    encodeURIComponent(
                        displayName(product.category)
                    ) +
                    "%0A" +
                    "Brand: " +
                    encodeURIComponent(
                        displayName(product.brand)
                    ) +
                    "%0A" +
                    "Part Number: " +
                    encodeURIComponent(
                        product.partNumber
                    ) +
                    "%0A" +
                    "CO Code: " +
                    encodeURIComponent(
                        product.coCode
                    );


                const phone =
                    "919999999999";

                window.open(
                    "https://wa.me/" +
                    phone +
                    "?text=" +
                    message,
                    "_blank"
                );

            }
        );


        /*
         * View Image
         */

        const viewButton =
            document.createElement("button");

        viewButton.type =
            "button";

        viewButton.className =
            "add-cart-button";

        viewButton.textContent =
            "View Part";


        viewButton.addEventListener(
            "click",
            function () {

                window.open(
                    product.image,
                    "_blank"
                );

            }
        );


        actions.appendChild(
            viewButton
        );

        actions.appendChild(
            whatsapp
        );


        body.appendChild(title);

        body.appendChild(info);

        body.appendChild(actions);


        card.appendChild(imageWrap);

        card.appendChild(body);


        return card;
    }


    /* =====================================================
       RENDER PRODUCTS
    ===================================================== */

    function renderProducts() {

        if (!productGrid) {
            return;
        }


        productGrid.innerHTML = "";


        if (productCount) {

            productCount.textContent =
                filteredProducts.length +
                (
                    filteredProducts.length === 1
                        ? " product"
                        : " products"
                );
        }


        if (!filteredProducts.length) {

            productGrid.innerHTML = `

                <div style="
                    grid-column:1/-1;
                    background:#fff;
                    border:1px solid #e5ddd4;
                    border-radius:16px;
                    padding:40px 24px;
                    text-align:center;
                ">

                    <div style="
                        font-size:40px;
                        margin-bottom:12px;
                    ">
                        🔎
                    </div>

                    <h3 style="
                        margin:0 0 8px;
                        color:#4a3424;
                    ">
                        No spare parts found
                    </h3>

                    <p style="
                        margin:0;
                        color:#83776d;
                    ">
                        Try another search, brand or category.
                    </p>

                </div>

            `;

            return;
        }


        const fragment =
            document.createDocumentFragment();


        filteredProducts.forEach(
            function (product, index) {

                fragment.appendChild(
                    createProductCard(
                        product,
                        index
                    )
                );

            }
        );


        productGrid.appendChild(
            fragment
        );

    }


    /* =====================================================
       LOADING UI
    ===================================================== */

    function showLoading() {

        if (!productGrid) {
            return;
        }


        productGrid.innerHTML = `

            <div style="
                grid-column:1/-1;
                padding:50px 20px;
                text-align:center;
            ">

                <div style="
                    width:36px;
                    height:36px;
                    margin:0 auto 15px;
                    border:3px solid #e5ddd4;
                    border-top-color:#b97825;
                    border-radius:50%;
                    animation:hardwareSpin .8s linear infinite;
                "></div>

                <strong>
                    Loading spare parts...
                </strong>

                <p style="
                    margin-top:8px;
                    color:#83776d;
                ">
                    Reading the Google Drive catalogue.
                </p>

            </div>

        `;
    }


    /* =====================================================
       ERROR UI
    ===================================================== */

    function showError(message) {

        if (!productGrid) {
            return;
        }


        productGrid.innerHTML = `

            <div style="
                grid-column:1/-1;
                background:#fff;
                border:1px solid #e4caca;
                border-radius:16px;
                padding:30px 22px;
                text-align:center;
            ">

                <div style="
                    font-size:36px;
                    margin-bottom:10px;
                ">
                    ⚠️
                </div>

                <h3 style="
                    margin:0 0 8px;
                    color:#4a3424;
                ">
                    Google Drive catalogue could not be loaded
                </h3>

                <p style="
                    margin:0;
                    color:#83776d;
                    line-height:1.6;
                ">
                    ${escapeHtml(message)}
                </p>

            </div>

        `;
    }


    /* =====================================================
       GOOGLE DRIVE LOAD
    ===================================================== */

    async function loadCatalogue() {

        showLoading();


        if (
            !window.GoogleDriveConnector
        ) {

            showError(
                "google_drive.js was not loaded."
            );

            return;
        }


        if (
            typeof window.GoogleDriveConnector
                .getGoogleDriveImages !== "function"
        ) {

            showError(
                "Google Drive connector is incomplete."
            );

            return;
        }


        try {

            const files =
                await window.GoogleDriveConnector
                    .getGoogleDriveImages();


            console.log(
                "Google Drive files returned:",
                files
            );


            if (!Array.isArray(files)) {

                showError(
                    "Google Drive returned an invalid response."
                );

                return;
            }


            if (!files.length) {

                showError(
                    "No images were returned from the configured Google Drive folder. Check that the folder ID is correct and that the images are accessible."
                );

                return;
            }


            allProducts =
                createProductsFromDriveFiles(files);


            console.log(
                "Parsed catalogue products:",
                allProducts
            );


            if (!allProducts.length) {

                showError(
                    "Images were found in Google Drive, but their filenames do not match the required format: Product-C-Category-B-Brand-S-PartNumber-CO-Code.jpg"
                );

                return;
            }


            populateCategoryFilter();

            populateBrandFilter();

            filterProducts();


        } catch (error) {

            console.error(
                "Catalogue loading error:",
                error
            );


            showError(
                error.message ||
                "Unable to load Google Drive catalogue."
            );

        }

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    if (searchFilter) {

        searchFilter.addEventListener(
            "input",
            function (event) {

                searchText =
                    normalize(
                        event.target.value
                    );

                filterProducts();

            }
        );

    }


    /* =====================================================
       CATEGORY
    ===================================================== */

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            function (event) {

                selectedCategory =
                    normalize(
                        event.target.value
                    );


                selectedBrand =
                    "All";


                populateBrandFilter();

                updatePageHeader();

                filterProducts();

            }
        );

    }


    /* =====================================================
       BRAND
    ===================================================== */

    if (brandFilter) {

        brandFilter.addEventListener(
            "change",
            function (event) {

                selectedBrand =
                    normalize(
                        event.target.value
                    );

                filterProducts();

            }
        );

    }


    /* =====================================================
       CLEAR FILTERS
    ===================================================== */

    if (clearFilters) {

        clearFilters.addEventListener(
            "click",
            function () {

                selectedCategory =
                    getUrlCategory() === "All"
                        ? "All"
                        : normalize(
                            getUrlCategory()
                        );


                selectedBrand =
                    "All";

                searchText =
                    "";


                if (searchFilter) {
                    searchFilter.value = "";
                }


                populateCategoryFilter();

                populateBrandFilter();

                if (categoryFilter) {

                    categoryFilter.value =
                        selectedCategory;
                }


                updatePageHeader();

                filterProducts();

            }
        );

    }


    /* =====================================================
       PUBLIC FUNCTIONS
    ===================================================== */

    window.chooseCategory =
        function (category) {

            window.location.href =
                "category.html?category=" +
                encodeURIComponent(category);

        };


    window.chooseBrand =
        function (brand) {

            window.location.href =
                "category.html?brand=" +
                encodeURIComponent(brand);

        };


    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function init() {

        applyInitialCategory();

        const params =
            new URLSearchParams(
                window.location.search
            );

        const urlBrand =
            params.get("brand");


        if (urlBrand) {

            selectedBrand =
                normalize(urlBrand);
        }


        await loadCatalogue();

    }


    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }

})();
