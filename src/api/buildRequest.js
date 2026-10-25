// Превращает разобранные CSV и параметры формы в тело запроса POST /api/analysis
// (см. docs/api-contract.md). Все пороги — дроби, период — «ГГГГ-ММ» или null (весь период).

export function buildAnalysisRequest(dataset, params) {
  return {
    params: {
      abc: { a: params.abc.a, b: params.abc.b },
      xyz: { x: params.xyz.x, y: params.xyz.y },
      from: params.from || null,
      to: params.to || null,
    },
    items: dataset.items.items,
    sales: dataset.sales.sales,
  }
}
