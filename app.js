const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const seedProducts = [
  {
    id: 1,
    name: "ELF BAR Combo",
    category: "Одноразовые",
    variantType: "Вкус",
    price: 1890,
    badge: "ХИТ",
    art: "#f05a87",
    popular: 99,
    variants: [
      { name: "Арбуз · лёд", stock: 9, color: "#f05a87" },
      { name: "Черника · малина", stock: 6, color: "#7646de" },
      { name: "Манго · маракуйя", stock: 5, color: "#f39736" },
    ],
  },
  {
    id: 2,
    name: "WAKA SoPro",
    category: "Одноразовые",
    variantType: "Вкус",
    price: 1690,
    badge: "NEW",
    art: "#4aa8f0",
    popular: 94,
    variants: [
      { name: "Голубая малина", stock: 7, color: "#4aa8f0" },
      { name: "Виноград · лёд", stock: 8, color: "#8b59e9" },
      { name: "Клубника · киви", stock: 4, color: "#e84c80" },
    ],
  },
  {
    id: 3,
    name: "Chaser Black",
    category: "Жидкости",
    variantType: "Вкус",
    price: 690,
    badge: "ХИТ",
    art: "#64c47c",
    popular: 92,
    variants: [
      { name: "Яблоко · мята", stock: 12, color: "#64c47c" },
      { name: "Лесные ягоды", stock: 8, color: "#aa45a9" },
      { name: "Цитрус", stock: 10, color: "#e2a231" },
    ],
  },
  {
    id: 4,
    name: "Vaporesso XROS 4 Mini",
    category: "Устройства",
    variantType: "Цвет",
    price: 2990,
    badge: "NEW",
    art: "#82a0c8",
    popular: 96,
    variants: [
      { name: "Чёрный", stock: 4, color: "#32343a" },
      { name: "Серебристый", stock: 3, color: "#aeb8c4" },
      { name: "Розовый", stock: 2, color: "#e67da8" },
      { name: "Голубой", stock: 5, color: "#55a6de" },
    ],
  },
  {
    id: 5,
    name: "VooPoo Argus",
    category: "Устройства",
    variantType: "Цвет",
    price: 3490,
    badge: "ХИТ",
    art: "#a65a3c",
    popular: 89,
    variants: [
      { name: "Чёрный", stock: 5, color: "#303035" },
      { name: "Коричневый", stock: 3, color: "#925638" },
      { name: "Красный", stock: 2, color: "#b53d48" },
    ],
  },
  {
    id: 6,
    name: "XROS Cartridge",
    category: "Расходники",
    variantType: "Сопротивление",
    price: 390,
    badge: "",
    art: "#b4c0cc",
    popular: 87,
    variants: [
      { name: "0.6 Ом", stock: 18, color: "#aab6c4" },
      { name: "0.8 Ом", stock: 22, color: "#93a2b2" },
      { name: "1.0 Ом", stock: 14, color: "#7e8e9f" },
    ],
  },
  {
    id: 7,
    name: "Brusko Salt",
    category: "Жидкости",
    variantType: "Вкус",
    price: 590,
    badge: "NEW",
    art: "#ef8149",
    popular: 84,
    variants: [
      { name: "Персик", stock: 10, color: "#ef8149" },
      { name: "Кола · лёд", stock: 8, color: "#965535" },
      { name: "Малина", stock: 11, color: "#db4b70" },
    ],
  },
  {
    id: 8,
    name: "Lost Mary BM",
    category: "Одноразовые",
    variantType: "Вкус",
    price: 1790,
    badge: "ХИТ",
    art: "#4eb9be",
    popular: 91,
    variants: [
      { name: "Киви · маракуйя", stock: 7, color: "#4eb9be" },
      { name: "Вишня · лимон", stock: 6, color: "#cf4e66" },
      { name: "Мятный лёд", stock: 9, color: "#50bad1" },
    ],
  },
];

const storedProducts = JSON.parse(localStorage.getItem("ph-products") || "null");
const productsAreCurrent =
  Array.isArray(storedProducts) &&
  storedProducts.length &&
  storedProducts.every((item) => Array.isArray(item.variants));

const state = {
  products: productsAreCurrent ? storedProducts : JSON.parse(JSON.stringify(seedProducts)),
  cart: JSON.parse(localStorage.getItem("ph-cart") || "{}"),
  favorites: JSON.parse(localStorage.getItem("ph-favorites") || "[]"),
  orders: JSON.parse(localStorage.getItem("ph-orders") || "[]"),
  category: "Все",
  search: "",
  sort: "popular",
  maxPrice: 5000,
  inStock: false,
  selectedProductId: null,
  selectedVariantIndex: 0,
};

function migrateCart() {
  const next = {};
  Object.entries(state.cart).forEach(([key, quantity]) => {
    if (key.includes(":")) {
      next[key] = quantity;
      return;
    }
    const product = findProduct(key);
    if (product?.variants?.length) next[`${product.id}:0`] = quantity;
  });
  state.cart = next;
}

function save() {
  localStorage.setItem("ph-products", JSON.stringify(state.products));
  localStorage.setItem("ph-cart", JSON.stringify(state.cart));
  localStorage.setItem("ph-favorites", JSON.stringify(state.favorites));
  localStorage.setItem("ph-orders", JSON.stringify(state.orders));
}

function money(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

function findProduct(id) {
  return state.products.find((item) => item.id === Number(id));
}

function productStock(item) {
  return item.variants.reduce((total, variant) => total + variant.stock, 0);
}

function variantPrice(item, variantIndex) {
  return item.variants[variantIndex]?.price || item.price;
}

function cartKey(productId, variantIndex) {
  return `${productId}:${variantIndex}`;
}

function parseCartKey(key) {
  const [productId, variantIndex] = key.split(":").map(Number);
  return { productId, variantIndex };
}

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("show"), 1800);
}

function renderChips() {
  const categories = ["Все", ...new Set(state.products.map((item) => item.category))];
  $("#categoryChips").innerHTML = categories
    .map(
      (category) =>
        `<button class="${state.category === category ? "active" : ""}" data-category="${category}">${category}</button>`,
    )
    .join("");
}

function visibleProducts() {
  const query = state.search.trim().toLowerCase();
  const list = state.products.filter((item) => {
    const searchable = [item.name, item.category, ...item.variants.map((variant) => variant.name)]
      .join(" ")
      .toLowerCase();
    return (
      (state.category === "Все" || item.category === state.category) &&
      (!query || searchable.includes(query)) &&
      item.price <= state.maxPrice &&
      (!state.inStock || productStock(item) > 0)
    );
  });
  return list.sort((a, b) => {
    if (state.sort === "priceAsc") return a.price - b.price;
    if (state.sort === "priceDesc") return b.price - a.price;
    if (state.sort === "new") return Number(b.badge === "NEW") - Number(a.badge === "NEW");
    return b.popular - a.popular;
  });
}

function card(item) {
  const favorite = state.favorites.includes(item.id);
  const stock = productStock(item);
  return `
    <article class="product-card" data-open-product="${item.id}">
      <button class="fav ${favorite ? "active" : ""}" data-fav="${item.id}" aria-label="Избранное">${favorite ? "♥" : "♡"}</button>
      ${item.badge ? `<span class="badge ${item.badge === "ХИТ" ? "hit" : ""}">${item.badge}</span>` : ""}
      <div class="product-art" style="--art:${item.art}"></div>
      <div class="product-info">
        <h3>${item.name}</h3>
        <p>${item.category} · ${item.variants.length} ${item.variants.length === 1 ? "вариант" : "варианта"}</p>
        <div class="product-foot">
          <div><small>от</small> <b>${money(item.price)}</b></div>
          <button class="add-btn" data-open-product="${item.id}" aria-label="Выбрать вариант">${stock ? "+" : "×"}</button>
        </div>
      </div>
    </article>`;
}

function renderProducts() {
  const list = visibleProducts();
  $("#productGrid").innerHTML = list.map(card).join("") || '<div class="empty">Ничего не найдено.</div>';
  const favorites = state.products.filter((item) => state.favorites.includes(item.id));
  $("#favoritesGrid").innerHTML =
    favorites.map(card).join("") || '<div class="empty">Здесь появятся понравившиеся модели.</div>';
}

function cartLine(key, quantity) {
  const { productId, variantIndex } = parseCartKey(key);
  const item = findProduct(productId);
  const variant = item?.variants[variantIndex];
  if (!item || !variant) return "";
  return `
    <div class="cart-item">
      <div class="cart-thumb" style="--art:${variant.color || item.art}"></div>
      <div>
        <h3>${item.name}</h3>
        <p>${item.variantType}: ${variant.name}</p>
        <b>${money(variantPrice(item, variantIndex))}</b>
      </div>
      <div class="qty">
        <button data-qty="${key}" data-delta="-1" aria-label="Уменьшить">−</button>
        <b>${quantity}</b>
        <button data-qty="${key}" data-delta="1" aria-label="Увеличить">+</button>
      </div>
    </div>`;
}

function renderCart() {
  const entries = Object.entries(state.cart).filter(([key]) => {
    const { productId, variantIndex } = parseCartKey(key);
    return Boolean(findProduct(productId)?.variants[variantIndex]);
  });
  $("#cartItems").innerHTML =
    entries.map(([key, quantity]) => cartLine(key, quantity)).join("") ||
    '<div class="empty">Корзина пока пуста.</div>';

  const total = entries.reduce((sum, [key, quantity]) => {
    const { productId, variantIndex } = parseCartKey(key);
    return sum + variantPrice(findProduct(productId), variantIndex) * quantity;
  }, 0);
  const count = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  $("#subtotal").textContent = money(total);
  $("#cartTotal").textContent = money(total);
  $("#cartBadge").textContent = count;
  $("#navCartBadge").textContent = count;
  $("#cartBadge").classList.toggle("hidden", count === 0);
  $("#navCartBadge").classList.toggle("hidden", count === 0);
  $("#checkoutBtn").disabled = count === 0;
  document.dispatchEvent(new CustomEvent("parhub:cartchange", { detail: { count } }));
}

function addCart(productId, variantIndex) {
  const item = findProduct(productId);
  const variant = item?.variants[variantIndex];
  if (!item || !variant || variant.stock < 1) {
    toast("Этого варианта сейчас нет в наличии");
    return;
  }
  const key = cartKey(item.id, variantIndex);
  state.cart[key] = Math.min((state.cart[key] || 0) + 1, variant.stock);
  save();
  renderCart();
  window.ParHubTelegram?.webApp?.HapticFeedback?.impactOccurred("light");
  toast(`${variant.name} добавлен в корзину`);
}

function updateProductModalSelection(variantIndex) {
  const item = findProduct(state.selectedProductId);
  if (!item) return;
  state.selectedVariantIndex = Number(variantIndex);
  const variant = item.variants[state.selectedVariantIndex];
  $$(".variant-option").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.variant) === state.selectedVariantIndex);
  });
  const art = $("#modalProductArt");
  if (art) art.style.setProperty("--art", variant.color || item.art);
  $("#modalProductStock").textContent = variant.stock > 0 ? `В наличии: ${variant.stock}` : "Нет в наличии";
  $("#modalProductPrice").textContent = money(variantPrice(item, state.selectedVariantIndex));
  const addButton = $("#modalAddButton");
  addButton.disabled = variant.stock < 1;
  addButton.textContent = variant.stock > 0 ? "Добавить в корзину" : "Нет в наличии";
}

function openProduct(productId) {
  const item = findProduct(productId);
  if (!item) return;
  state.selectedProductId = item.id;
  state.selectedVariantIndex = Math.max(
    0,
    item.variants.findIndex((variant) => variant.stock > 0),
  );
  $("#productModalBody").innerHTML = `
    <button class="modal-close" data-close="productModal">×</button>
    <div class="modal-art" id="modalProductArt" style="--art:${item.art}"></div>
    <p class="product-category">${item.category}</p>
    <h2>${item.name}</h2>
    <p class="variant-title">Выберите: ${item.variantType.toLowerCase()}</p>
    <div class="variant-picker">
      ${item.variants
        .map(
          (variant, index) => `
          <button class="variant-option" data-variant="${index}" data-unavailable="${variant.stock < 1}">
            <span>${variant.name}</span>
          </button>`,
        )
        .join("")}
    </div>
    <p class="muted" id="modalProductStock"></p>
    <div class="modal-price" id="modalProductPrice"></div>
    <button class="primary" id="modalAddButton" data-add-selected>Добавить в корзину</button>`;
  $("#productModal").classList.add("open");
  updateProductModalSelection(state.selectedVariantIndex);
  document.dispatchEvent(new CustomEvent("parhub:modalchange"));
}

function formatOrderDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function renderOrderHistory() {
  const orders = state.orders.slice().reverse();
  $("#orderHistory").innerHTML =
    orders
      .map(
        (order) => `
        <article class="history-order">
          <div class="history-order-head">
            <div><h3>Заказ #${order.id}</h3><time>${formatOrderDate(order.createdAt)}</time></div>
            <span class="order-status-pill">${order.status}</span>
          </div>
          <p>${order.items
            .map((line) => `${line.name}${line.variantName ? ` · ${line.variantName}` : ""} × ${line.qty}`)
            .join("<br>")}</p>
          <div class="history-order-total"><span>Итого</span><b>${money(order.total)}</b></div>
        </article>`,
      )
      .join("") ||
    '<div class="empty">У вас пока нет заказов.<button class="primary empty-action" data-view="shop">Перейти в каталог</button></div>';
}

function setView(name) {
  $$(".view").forEach((view) => view.classList.remove("active"));
  $(`#${name}View`)?.classList.add("active");
  $$(".bottom-nav button").forEach((button) =>
    button.classList.toggle("active", button.dataset.view === name),
  );
  if (name === "admin") renderAdmin();
  if (name === "orders") renderOrderHistory();
  window.scrollTo(0, 0);
  document.dispatchEvent(new CustomEvent("parhub:viewchange", { detail: { view: name } }));
}

window.setView = setView;

function renderAdmin() {
  const revenue = state.orders.reduce((sum, order) => sum + order.total, 0);
  $("#orderCount").textContent = state.orders.length;
  $("#productCount").textContent = state.products.length;
  $("#revenue").textContent = money(revenue);
  $("#adminOrders").innerHTML =
    state.orders
      .slice()
      .reverse()
      .map(
        (order) => `
        <div class="order-card">
          <div>
            <h3>#${order.id} · ${order.name}</h3>
            <select class="order-status" data-order="${order.id}">
              ${["Новый", "В работе", "Готов", "Выдан"]
                .map((status) => `<option ${order.status === status ? "selected" : ""}>${status}</option>`)
                .join("")}
            </select>
          </div>
          <p>${order.phone} · ${order.delivery}</p>
          <p>${order.items
            .map((line) => `${line.name}${line.variantName ? ` — ${line.variantName}` : ""} × ${line.qty}`)
            .join(", ")}</p>
          <b>${money(order.total)}</b>
        </div>`,
      )
      .join("") || '<div class="empty">Новых заказов пока нет.</div>';

  $("#adminProductList").innerHTML = state.products
    .map(
      (item) => `
      <div class="admin-product">
        <div>
          <h3>${item.name}</h3>
          <p>${item.category} · ${money(item.price)} · ${item.variants.length} вариантов · остаток ${productStock(item)}</p>
        </div>
        <button data-edit="${item.id}">Изменить</button>
      </div>`,
    )
    .join("");
}

document.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) setView(viewButton.dataset.view);

  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    state.category = categoryButton.dataset.category;
    renderChips();
    renderProducts();
  }

  const favoriteButton = event.target.closest("[data-fav]");
  if (favoriteButton) {
    event.stopPropagation();
    const id = Number(favoriteButton.dataset.fav);
    state.favorites = state.favorites.includes(id)
      ? state.favorites.filter((favoriteId) => favoriteId !== id)
      : [...state.favorites, id];
    save();
    renderProducts();
  }

  const productButton = event.target.closest("[data-open-product]");
  if (productButton && !favoriteButton) openProduct(productButton.dataset.openProduct);

  const variantButton = event.target.closest("[data-variant]");
  if (variantButton) updateProductModalSelection(variantButton.dataset.variant);

  if (event.target.closest("[data-add-selected]")) {
    addCart(state.selectedProductId, state.selectedVariantIndex);
    $("#productModal").classList.remove("open");
    document.dispatchEvent(new CustomEvent("parhub:modalchange"));
  }

  const closeButton = event.target.closest("[data-close]");
  if (closeButton) {
    $(`#${closeButton.dataset.close}`)?.classList.remove("open");
    document.dispatchEvent(new CustomEvent("parhub:modalchange"));
  }

  const quantityButton = event.target.closest("[data-qty]");
  if (quantityButton) {
    const key = quantityButton.dataset.qty;
    const { productId, variantIndex } = parseCartKey(key);
    const variant = findProduct(productId)?.variants[variantIndex];
    if (!variant) return;
    state.cart[key] = Math.max(
      0,
      Math.min((state.cart[key] || 0) + Number(quantityButton.dataset.delta), variant.stock),
    );
    if (!state.cart[key]) delete state.cart[key];
    save();
    renderCart();
  }

  const editButton = event.target.closest("[data-edit]");
  if (editButton) editProduct(editButton.dataset.edit);

  const faqButton = event.target.closest("[data-faq]");
  if (faqButton) {
    faqButton.classList.toggle("open");
    faqButton.nextElementSibling?.classList.toggle("hidden");
  }
});

$("#filterBtn").onclick = () => $("#filterPanel").classList.toggle("open");
$("#searchToggle").onclick = () => {
  $("#searchPanel").classList.toggle("open");
  $("#searchInput").focus();
};
$("#searchInput").oninput = (event) => {
  state.search = event.target.value;
  renderProducts();
};
$("#sortSelect").onchange = (event) => {
  state.sort = event.target.value;
  renderProducts();
};
$("#priceRange").oninput = (event) => {
  state.maxPrice = Number(event.target.value);
  $("#priceValue").textContent = money(state.maxPrice);
  renderProducts();
};
$("#inStockOnly").onchange = (event) => {
  state.inStock = event.target.checked;
  renderProducts();
};

$("#checkoutBtn").onclick = () => {
  if (!Object.keys(state.cart).length) return;
  if (!window.ParHubTelegram?.requireAuth()) return;
  $("#checkoutModal").classList.add("open");
  document.dispatchEvent(new CustomEvent("parhub:modalchange"));
};

$("#checkoutForm").onsubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const items = Object.entries(state.cart)
    .map(([key, qty]) => {
      const { productId, variantIndex } = parseCartKey(key);
      const item = findProduct(productId);
      const variant = item?.variants[variantIndex];
      if (!item || !variant) return null;
      return {
        id: item.id,
        name: item.name,
        variantIndex,
        variantName: variant.name,
        price: variantPrice(item, variantIndex),
        qty,
      };
    })
    .filter(Boolean);
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  state.orders.push({
    id: String(Date.now()).slice(-6),
    telegramUserId: window.ParHubTelegram?.user?.id || null,
    name: formData.get("name"),
    phone: formData.get("phone"),
    delivery: formData.get("delivery"),
    comment: formData.get("comment"),
    items,
    total,
    status: "Новый",
    createdAt: new Date().toISOString(),
  });
  items.forEach((line) => {
    const variant = findProduct(line.id)?.variants[line.variantIndex];
    if (variant) variant.stock = Math.max(0, variant.stock - line.qty);
  });
  state.cart = {};
  save();
  renderCart();
  renderProducts();
  event.target.reset();
  $("#checkoutModal").classList.remove("open");
  toast("Заказ принят! Скоро свяжемся");
  setView("profile");
};

let adminTaps = 0;
let adminTapTimer;
$("#profileAvatar").onclick = () => {
  adminTaps += 1;
  clearTimeout(adminTapTimer);
  adminTapTimer = setTimeout(() => (adminTaps = 0), 1800);
  if (adminTaps === 3) toast("Ещё 2 нажатия");
  if (adminTaps >= 5) {
    adminTaps = 0;
    clearTimeout(adminTapTimer);
    setView("admin");
  }
};

$$("[data-admin-tab]").forEach((button) => {
  button.onclick = () => {
    $$("[data-admin-tab]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    $("#adminOrders").classList.toggle("hidden", button.dataset.adminTab !== "orders");
    $("#adminProducts").classList.toggle("hidden", button.dataset.adminTab !== "products");
  };
});

document.addEventListener("change", (event) => {
  if (!event.target.matches("[data-order]")) return;
  const order = state.orders.find((item) => item.id === event.target.dataset.order);
  if (!order) return;
  order.status = event.target.value;
  save();
  toast("Статус обновлён");
});

function editProduct(id) {
  const item = id ? findProduct(id) : null;
  const form = $("#productForm");
  form.reset();
  form.elements.id.value = item?.id || "";
  form.elements.name.value = item?.name || "";
  form.elements.category.value = item?.category || "Одноразовые";
  form.elements.variants.value = item?.variants.map((variant) => variant.name).join(", ") || "";
  form.elements.price.value = item?.price || "";
  form.elements.stock.value = item ? Math.max(...item.variants.map((variant) => variant.stock)) : "";
  $("#editProductTitle").textContent = item ? "Редактировать товар" : "Новый товар";
  $("#editProductModal").classList.add("open");
  document.dispatchEvent(new CustomEvent("parhub:modalchange"));
}

$("#addProductBtn").onclick = () => editProduct();
$("#productForm").onsubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const id = Number(formData.get("id")) || Date.now();
  const old = findProduct(id);
  const names = String(formData.get("variants"))
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  const stock = Number(formData.get("stock"));
  const fallbackColors = ["#a855f7", "#ed36a2", "#ff7b35", "#4aa8f0", "#52e0a2"];
  const data = {
    id,
    name: formData.get("name"),
    category: formData.get("category"),
    variantType: old?.variantType || (formData.get("category") === "Устройства" ? "Цвет" : "Вкус"),
    price: Number(formData.get("price")),
    badge: old?.badge || "NEW",
    art: old?.art || "#a646e7",
    popular: old?.popular || 1,
    variants: names.map((name, index) => ({
      name,
      stock: old?.variants[index]?.stock ?? stock,
      color: old?.variants[index]?.color || fallbackColors[index % fallbackColors.length],
    })),
  };
  if (old) Object.assign(old, data);
  else state.products.push(data);
  save();
  renderChips();
  renderProducts();
  renderAdmin();
  $("#editProductModal").classList.remove("open");
  toast("Товар сохранён");
};

if (!localStorage.getItem("ph-age")) $("#ageGate").classList.add("open");
$("#confirmAge").onclick = () => {
  localStorage.setItem("ph-age", "yes");
  $("#ageGate").classList.remove("open");
};
$("#denyAge").onclick = () => {
  document.querySelector(".age-card").innerHTML =
    "<h1>Доступ ограничен</h1><p>Каталог доступен только совершеннолетним пользователям.</p>";
};

document.addEventListener("gesturestart", (event) => event.preventDefault(), { passive: false });
document.addEventListener(
  "touchmove",
  (event) => {
    if (event.touches.length > 1) event.preventDefault();
  },
  { passive: false },
);

migrateCart();
save();
renderChips();
renderProducts();
renderCart();
