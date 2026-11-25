// 89999 → "89 999 ₴"
export function formatPrice(value) {
  return new Intl.NumberFormat('uk-UA').format(value) + ' ₴'
}
