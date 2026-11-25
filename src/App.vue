<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import ProductCard from './components/ProductCard.vue'
import ProductModal from './components/ProductModal.vue'
import CartModal from './components/CartModal.vue'
import { formatPrice } from './utils/format.js'

const CART_KEY = 'metagear-cart'

// ---------- Стан ----------
const products = ref([])
const loading = ref(true)
const loadError = ref(false)

const category = ref('Усі')
const search = ref('')
const sort = ref('popular') // popular | cheap | expensive | name

const cart = ref(loadCart()) // [{ id, qty }]
const cartOpen = ref(false)
const selected = ref(null) // товар, відкритий у вікні
const filtersOpen = ref(false) // панель фільтрів на телефоні

// ---------- Завантаження каталогу ----------
async function loadProducts() {
  loading.value = true
  loadError.value = false
  try {
    const response = await fetch(import.meta.env.BASE_URL + 'products.json')
    if (!response.ok) throw new Error('HTTP ' + response.status)
    const data = await response.json()
    // шлях до фото робимо повним (важливо, якщо сайт лежить у підпапці на GitHub Pages)
    products.value = data.map((p) => ({ ...p, image: import.meta.env.BASE_URL + p.image }))
  } catch (error) {
    console.error('Не вдалося завантажити каталог:', error)
    loadError.value = true
  } finally {
    loading.value = false
  }
}
onMounted(loadProducts)

// ---------- Фільтр, пошук, сортування (computed) ----------
const categories = computed(() => ['Усі', ...new Set(products.value.map((p) => p.category))])

function countIn(name) {
  return name === 'Усі' ? products.value.length : products.value.filter((p) => p.category === name).length
}

const visibleProducts = computed(() => {
  const query = search.value.trim().toLowerCase()
  const list = products.value.filter((p) =>
    (category.value === 'Усі' || p.category === category.value) &&
    p.name.toLowerCase().includes(query),
  )
  // toSorted() повертає новий масив — у computed нічого не змінюємо
  if (sort.value === 'cheap') return list.toSorted((a, b) => a.price - b.price)
  if (sort.value === 'expensive') return list.toSorted((a, b) => b.price - a.price)
  if (sort.value === 'name') return list.toSorted((a, b) => a.name.localeCompare(b.name, 'uk'))
  return list
})

function resetFilters() {
  category.value = 'Усі'
  search.value = ''
}

// ---------- Кошик ----------
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY))
    return Array.isArray(saved) ? saved.filter((i) => Number.isInteger(i.id) && i.qty > 0) : []
  } catch {
    return [] // зіпсовані дані або заборонене сховище — починаємо з порожнього кошика
  }
}

// Кожна зміна кошика одразу записується в localStorage
watch(cart, (value) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(value))
  } catch (error) {
    console.error('Не вдалося зберегти кошик:', error)
  }
}, { deep: true })

// Рядки кошика: беремо дані товару з каталогу + кількість
const cartItems = computed(() =>
  cart.value
    .map((item) => ({ ...products.value.find((p) => p.id === item.id), qty: item.qty }))
    .filter((item) => item.name), // товар міг зникнути з каталогу
)
const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.qty, 0))
const cartTotal = computed(() => cartItems.value.reduce((sum, item) => sum + item.price * item.qty, 0))

const isInCart = (id) => cart.value.some((item) => item.id === id)

function addToCart(product) {
  const item = cart.value.find((i) => i.id === product.id)
  if (item) item.qty = Math.min(item.qty + 1, 99)
  else cart.value.push({ id: product.id, qty: 1 })
}
function changeQty(id, delta) {
  const item = cart.value.find((i) => i.id === id)
  if (item) item.qty = Math.min(Math.max(item.qty + delta, 1), 99)
}
function removeFromCart(id) {
  cart.value = cart.value.filter((i) => i.id !== id)
}
function onOrder() {
  cart.value = [] // замовлення оформлено — кошик очищаємо
}
</script>

<template>
  <a class="skip" href="#catalog">Перейти до каталогу</a>

  <header class="header">
    <div class="wrap header-row">
      <a class="logo" href="./" aria-label="MetaGear — на головну">
        <span class="logo-mark" aria-hidden="true">M</span>
        <span>Meta<b>Gear</b></span>
      </a>

      <button type="button" class="btn catalog-btn" @click="filtersOpen = !filtersOpen" :aria-expanded="filtersOpen" aria-controls="filters">
        ☰ <span class="catalog-text">Каталог</span>
      </button>

      <label class="search">
        <span class="visually-hidden">Пошук товарів</span>
        <input v-model="search" type="search" placeholder="Я шукаю… (наприклад, ThinkPad)" autocomplete="off">
      </label>

      <button type="button" class="cart-link" @click="cartOpen = true" :aria-label="'Кошик, товарів: ' + cartCount">
        <span class="cart-icon" aria-hidden="true">🛒</span>
        <span class="cart-text">Кошик</span>
        <span v-if="cartCount" class="cart-count">{{ cartCount }}</span>
      </button>
    </div>
  </header>

  <div class="wrap layout">
    <aside id="filters" class="filters" :class="{ open: filtersOpen }">
      <h2>Категорії</h2>
      <ul>
        <li v-for="name in categories" :key="name">
          <button type="button" :class="{ active: name === category }" :aria-pressed="name === category"
                  @click="category = name; filtersOpen = false">
            {{ name }} <span>{{ countIn(name) }}</span>
          </button>
        </li>
      </ul>
    </aside>

    <main id="catalog" tabindex="-1">
      <div class="toolbar">
        <h1>{{ category === 'Усі' ? "Комп'ютерна техніка" : category }}</h1>
        <label class="sort">Сортувати:
          <select v-model="sort">
            <option value="popular">за замовчуванням</option>
            <option value="cheap">від дешевих до дорогих</option>
            <option value="expensive">від дорогих до дешевих</option>
            <option value="name">за назвою</option>
          </select>
        </label>
      </div>
      <p v-if="!loading && !loadError" class="found" aria-live="polite">Знайдено товарів: {{ visibleProducts.length }}</p>

      <p v-if="loading" class="message">Завантаження каталогу…</p>

      <div v-else-if="loadError" class="message">
        <p>Не вдалося завантажити каталог.</p>
        <button type="button" class="btn btn-accent" @click="loadProducts">Спробувати ще раз</button>
      </div>

      <div v-else-if="visibleProducts.length === 0" class="message">
        <p class="big">😕 Нічого не знайдено</p>
        <p>За запитом «{{ search }}» у категорії «{{ category }}» товарів немає.</p>
        <button type="button" class="btn btn-accent" @click="resetFilters">Скинути фільтри</button>
      </div>

      <div v-else class="grid">
        <ProductCard v-for="product in visibleProducts" :key="product.id" :product="product"
                     :in-cart="isInCart(product.id)" @add="addToCart" @open="selected = $event" />
      </div>
    </main>
  </div>

  <footer class="footer">
    <div class="wrap">
      <p><b>MetaGear</b> — «мета» в іграх означає найефективніше спорядження на цей момент. Тобто найактуальніше залізо.</p>
      <p>Навчальний проєкт (КП №2, Vue.js 3). Ціни, характеристики й замовлення умовні.</p>
    </div>
  </footer>

  <ProductModal v-if="selected" :product="selected" :in-cart="isInCart(selected.id)"
                @close="selected = null" @add="addToCart" />

  <CartModal v-if="cartOpen" :items="cartItems" :count="cartCount" :total="cartTotal"
             @close="cartOpen = false" @increase="changeQty($event, 1)" @decrease="changeQty($event, -1)"
             @remove="removeFromCart" @order="onOrder" />

  <!-- На телефоні: сума кошика внизу екрана -->
  <button v-if="cartCount" type="button" class="mobile-cart" @click="cartOpen = true">
    Кошик: {{ cartCount }} шт. · {{ formatPrice(cartTotal) }}
  </button>
</template>

<style scoped>
/* Верстка mobile-first, як у КП №1: базові стилі — для телефона,
   далі @media (min-width: …rem) додають колонки для ширших екранів.
   Брейкпоінти ті самі: 40rem (640px), 56rem (896px), 64rem (1024px). */

/* ---------- Шапка ---------- */
.header { position: sticky; top: 0; z-index: 20; background: var(--header); color: #fff; }
.header-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 12px; padding-block: 10px; }
.logo {
  display: flex; align-items: center; gap: .5rem; margin-right: auto;
  color: #fff; text-decoration: none; font-size: clamp(1.15rem, 1rem + .6vw, 1.35rem); font-weight: 600; letter-spacing: -.02em;
}
.logo b { color: #b794ff; }
.logo-mark { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 9px; background: var(--accent); font-weight: 800; }
.catalog-btn { padding: 0 .8rem; background: var(--accent); color: #fff; }
.catalog-text { display: none; }
.catalog-btn:hover { background: var(--accent-dark); }
.search { order: 3; flex-basis: 100%; min-width: 0; }
.search input {
  width: 100%; height: 42px; padding: 0 1rem; border: 2px solid transparent; border-radius: 8px; background: #fff; color: var(--text);
}
.search input:focus { outline: none; border-color: #b794ff; }
.cart-link {
  position: relative; display: flex; align-items: center; gap: .4rem; height: 42px; padding: 0 .75rem;
  border: 0; border-radius: 8px; background: none; color: #fff;
}
.cart-link:hover { background: rgba(255, 255, 255, .1); }
.cart-icon { font-size: 1.4rem; }
.cart-text { display: none; }
.cart-count {
  position: absolute; top: 0; left: 26px; min-width: 20px; height: 20px; padding: 0 5px;
  border-radius: 10px; background: var(--buy); font-size: .75rem; font-weight: 700; line-height: 20px; text-align: center;
}

/* ---------- Каталог ---------- */
.layout { display: grid; gap: 16px; padding-block: 20px 96px; }
.filters { display: none; padding: 1rem; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); }
.filters.open { display: block; }
.filters h2 { font-size: 1rem; margin-bottom: .5rem; }
.filters ul { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: .4rem; }
.filters button {
  display: flex; justify-content: space-between; gap: .5rem; padding: .55rem .7rem;
  border: 1px solid var(--border); border-radius: 6px; background: none; text-align: left;
}
.filters button span { color: var(--muted); font-size: .85rem; }
.filters button:hover { background: #f4f0ff; color: var(--accent); }
.filters button.active { background: #f0e8ff; color: var(--accent); font-weight: 600; }

main:focus { outline: none; }
.toolbar { display: flex; flex-direction: column; gap: 12px; }
.toolbar h1 { font-size: clamp(1.35rem, 1rem + 1.5vw, 1.9rem); }
.sort { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; font-size: .9rem; color: var(--muted); }
.sort select { height: 38px; max-width: 100%; padding: 0 .6rem; border: 1px solid var(--border); border-radius: 8px; background: #fff; color: var(--text); }
.found { margin: .4rem 0 1rem; color: var(--muted); font-size: .9rem; }

/* На телефоні — дві колонки карток, як у мобільних магазинах */
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.message { padding: 3rem 1rem; text-align: center; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); }
.message p { margin: 0 0 1rem; color: var(--muted); }
.message .big { font-size: 1.3rem; font-weight: 700; color: var(--text); }

.footer { padding-block: 24px 88px; background: #fff; border-top: 1px solid var(--border); color: var(--muted); font-size: .875rem; }
.footer p { margin: .25rem 0; max-width: 65ch; }

/* Кнопка кошика внизу екрана — лише на телефоні */
.mobile-cart {
  position: fixed; left: var(--gutter); right: var(--gutter); bottom: 12px; z-index: 30;
  min-height: 48px; border: 0; border-radius: 10px; background: var(--buy); color: #fff; font-weight: 700; box-shadow: var(--shadow);
}

/* ---------- Від 24rem (384px): місце для підпису «Каталог» ---------- */
@media (min-width: 24rem) {
  .catalog-text { display: inline; }
}

/* ---------- Від 40rem (640px): планшет ---------- */
@media (min-width: 40rem) {
  .header-row { flex-wrap: nowrap; min-height: 68px; padding-block: 0; }
  .logo { margin-right: 0; }
  .search { order: 0; flex: 1; }
  .cart-text { display: inline; }
  .toolbar { flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: space-between; }
  /* сітка як у КП №1: скільки влізе колонок, але не вужчих за 13rem */
  .grid { grid-template-columns: repeat(auto-fill, minmax(min(13rem, 100%), 1fr)); gap: 16px; }
  .layout { padding-bottom: 40px; }
  .footer { padding-bottom: 24px; }
  .mobile-cart { display: none; }
}

/* ---------- Від 56rem (896px): бокова панель категорій ---------- */
@media (min-width: 56rem) {
  .catalog-btn { display: none; }
  .layout { grid-template-columns: 230px 1fr; gap: 24px; padding-top: 24px; }
  .filters, .filters.open { display: block; align-self: start; position: sticky; top: 92px; }
  .filters ul { display: block; }
  .filters button { width: 100%; border-color: transparent; }
}
</style>
