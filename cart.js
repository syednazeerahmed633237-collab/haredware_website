
/*
==========================================================
LOG HARDWARE - SHOPPING CART
==========================================================
- Persistent cart using localStorage
- Numbered cart items: 1, 2, 3...
- Quantity controls
- Remove / clear
- WhatsApp cart enquiry
- Browse Spare Parts -> All Categories + All Brands
==========================================================
*/
(function () {
    "use strict";

    const STORAGE_KEY = "logHardwareCart";
    let cart = [];

    function loadCart() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );
            cart = Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.warn("LOG HARDWARE cart could not be restored:", error);
            cart = [];
        }
    }

    function saveCart() {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(cart)
        );
        renderCart();
    }

    function totalItems() {
        return cart.reduce(function (total, item) {
            return total + Number(item.quantity || 0);
        }, 0);
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[character];
        });
    }

    function ensureCartUI() {
        if (!document.getElementById("cartOverlay")) {
            const overlay = document.createElement("div");
            overlay.id = "cartOverlay";
            overlay.className = "cart-overlay";
            overlay.setAttribute("aria-hidden", "true");

            overlay.addEventListener("click", closeCart);

            document.body.appendChild(overlay);
        }

        if (!document.getElementById("cartDrawer")) {
            const drawer = document.createElement("aside");

            drawer.id = "cartDrawer";
            drawer.className = "cart-drawer";
            drawer.setAttribute("aria-label", "Shopping cart");
            drawer.setAttribute("aria-hidden", "true");

            drawer.innerHTML = `
                <div class="cart-header">
                    <div>
                        <span class="cart-eyebrow">YOUR SELECTION</span>
                        <h2>Your Cart</h2>
                    </div>

                    <button
                        type="button"
                        class="cart-close-button"
                        id="cartCloseButton"
                        aria-label="Close cart">
                        ×
                    </button>
                </div>

                <div class="cart-items" id="cartItems"></div>

                <div class="cart-empty" id="cartEmpty">
                    <div class="cart-empty-icon">🛒</div>

                    <h3>Your cart is empty</h3>

                    <p>
                        Add spare parts from the catalogue.
                    </p>

                    <a
                        class="cart-browse-button"
                        href="category.html?category=all&amp;brand=all">
                        Browse Spare Parts
                    </a>
                </div>

                <div class="cart-footer" id="cartFooter">
                    <div class="cart-summary">
                        <span>Items</span>
                        <strong id="cartTotalItems">0</strong>
                    </div>

                    <button
                        type="button"
                        class="cart-whatsapp-button"
                        id="cartWhatsAppButton">
                        💬 Send Cart on WhatsApp
                    </button>

                    <button
                        type="button"
                        class="cart-clear-button"
                        id="cartClearButton">
                        Clear Cart
                    </button>
                </div>
            `;

            document.body.appendChild(drawer);

            document
                .getElementById("cartCloseButton")
                .addEventListener("click", closeCart);

            document
                .getElementById("cartClearButton")
                .addEventListener("click", function () {
                    cart = [];
                    saveCart();
                });

            document
                .getElementById("cartWhatsAppButton")
                .addEventListener("click", sendCartToWhatsApp);
        }
    }

    function openCart() {
        ensureCartUI();

        const overlay = document.getElementById("cartOverlay");
        const drawer = document.getElementById("cartDrawer");

        overlay.classList.add("is-visible");
        drawer.classList.add("is-open");

        overlay.setAttribute("aria-hidden", "false");
        drawer.setAttribute("aria-hidden", "false");

        document.body.classList.add("cart-open");

        renderCart();
    }

    function closeCart() {
        const overlay = document.getElementById("cartOverlay");
        const drawer = document.getElementById("cartDrawer");

        if (!overlay || !drawer) return;

        overlay.classList.remove("is-visible");
        drawer.classList.remove("is-open");

        overlay.setAttribute("aria-hidden", "true");
        drawer.setAttribute("aria-hidden", "true");

        document.body.classList.remove("cart-open");
    }

    function addProductToCart(product) {
        loadCart();

        const id = String(
            product.id ||
            product.fileId ||
            product.filename ||
            (
                String(product.product || "") +
                "|" +
                String(product.brand || "") +
                "|" +
                String(product.partNumber || "")
            )
        );

        const existing = cart.find(function (item) {
            return item.id === id;
        });

        if (existing) {
            existing.quantity =
                Number(existing.quantity || 1) + 1;
        } else {
            cart.push({
                id: id,
                image: product.image || "",
                product: product.product || "",
                category: product.category || "",
                brand: product.brand || "",
                partNumber: product.partNumber || "",
                coCode: product.coCode || "",
                quantity: 1
            });
        }

        saveCart();
        openCart();
    }

    function changeQuantity(id, amount) {
        const item = cart.find(function (entry) {
            return entry.id === id;
        });

        if (!item) return;

        item.quantity =
            Number(item.quantity || 1) + amount;

        if (item.quantity <= 0) {
            cart = cart.filter(function (entry) {
                return entry.id !== id;
            });
        }

        saveCart();
    }

    function removeItem(id) {
        cart = cart.filter(function (item) {
            return item.id !== id;
        });

        saveCart();
    }

    function renderCart() {
        ensureCartUI();

        document
            .querySelectorAll("[data-cart-count]")
            .forEach(function (element) {
                element.textContent = totalItems();
            });

        const items = document.getElementById("cartItems");
        const empty = document.getElementById("cartEmpty");
        const footer = document.getElementById("cartFooter");
        const total = document.getElementById("cartTotalItems");

        if (!items || !empty || !footer) return;

        if (!cart.length) {
            items.innerHTML = "";

            empty.classList.add("is-visible");
            footer.classList.remove("is-visible");

            return;
        }

        empty.classList.remove("is-visible");
        footer.classList.add("is-visible");

        if (total) {
            total.textContent = totalItems();
        }

        items.innerHTML = cart.map(function (item, index) {
            const itemNumber = index + 1;

            return `
                <div class="cart-item">

                    <div class="cart-item-number">
                        ${itemNumber}
                    </div>

                    <div class="cart-item-image">
                        <img
                            src="${escapeHtml(item.image)}"
                            alt="${escapeHtml(item.product)}">
                    </div>

                    <div class="cart-item-content">

                        <div class="cart-item-title">
                            ${escapeHtml(item.product)}
                        </div>

                        <div class="cart-item-detail">
                            Category:
                            <strong>
                                ${escapeHtml(item.category)}
                            </strong>
                        </div>

                        <div class="cart-item-detail">
                            Brand:
                            <strong>
                                ${escapeHtml(item.brand)}
                            </strong>
                        </div>

                        <div class="cart-item-detail">
                            Part No:
                            <strong>
                                ${escapeHtml(item.partNumber || "-")}
                            </strong>
                        </div>

                        <div class="cart-item-detail">
                            CO Code:
                            <strong>
                                ${escapeHtml(item.coCode || "-")}
                            </strong>
                        </div>

                        <div class="cart-item-controls">

                            <button
                                type="button"
                                class="quantity-button"
                                data-cart-minus="${escapeHtml(item.id)}">
                                −
                            </button>

                            <span class="quantity-value">
                                ${Number(item.quantity || 1)}
                            </span>

                            <button
                                type="button"
                                class="quantity-button"
                                data-cart-plus="${escapeHtml(item.id)}">
                                +
                            </button>

                            <button
                                type="button"
                                class="cart-remove-button"
                                data-cart-remove="${escapeHtml(item.id)}">
                                Remove
                            </button>

                        </div>
                    </div>
                </div>
            `;
        }).join("");

        items
            .querySelectorAll("[data-cart-minus]")
            .forEach(function (button) {
                button.addEventListener("click", function () {
                    changeQuantity(
                        button.getAttribute("data-cart-minus"),
                        -1
                    );
                });
            });

        items
            .querySelectorAll("[data-cart-plus]")
            .forEach(function (button) {
                button.addEventListener("click", function () {
                    changeQuantity(
                        button.getAttribute("data-cart-plus"),
                        1
                    );
                });
            });

        items
            .querySelectorAll("[data-cart-remove]")
            .forEach(function (button) {
                button.addEventListener("click", function () {
                    removeItem(
                        button.getAttribute("data-cart-remove")
                    );
                });
            });
    }

    function sendCartToWhatsApp() {
        if (!cart.length) return;

        let message =
            "Hello LOG HARDWARE,\n\n" +
            "I would like to enquire about the following spare parts:\n\n";

        cart.forEach(function (item, index) {
            message +=
                (index + 1) +
                ". Product: " +
                (item.product || "-") +
                "\n" +
                "   Category: " +
                (item.category || "-") +
                "\n" +
                "   Brand: " +
                (item.brand || "-") +
                "\n" +
                "   Part Number: " +
                (item.partNumber || "-") +
                "\n" +
                "   CO Code: " +
                (item.coCode || "-") +
                "\n" +
                "   Quantity: " +
                Number(item.quantity || 1) +
                "\n\n";
        });

        message +=
            "Please confirm availability and price.";

        if (typeof window.openWhatsAppMessage === "function") {
            window.openWhatsAppMessage(message);
        } else {
            window.open(
                "https://wa.me/919999999999?text=" +
                encodeURIComponent(message),
                "_blank"
            );
        }
    }

    window.openCart = openCart;
    window.closeCart = closeCart;
    window.addProductToCart = addProductToCart;

    loadCart();

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            renderCart
        );
    } else {
        renderCart();
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeCart();
        }
    });

    document.addEventListener("click", function (event) {
        const cartButton =
            event.target.closest("[data-cart-button]");

        if (cartButton) {
            event.preventDefault();
            openCart();
        }
    });
})();
