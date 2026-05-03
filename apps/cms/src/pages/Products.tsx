import { useState } from 'react'
import { useTranslation } from '@repo/i18n'
import { useProducts, useDeleteProduct } from '@repo/api-client'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '@repo/types'

export function ProductsPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const { data, isLoading } = useProducts({ search })
  const deleteProduct = useDeleteProduct()

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      await deleteProduct.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  const products = data?.products || []

  console.log(products)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('products.title')}</h1>
        <Link
          to="/products/new"
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('products.addProduct')}
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('common.search')}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    {t('products.name')}
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    {t('products.sku')}
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    {t('products.price')}
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    {t('common.status')}
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((product: Product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0].url}
                            alt=""
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">{product.nameEn}</p>
                          <p className="text-sm text-slate-500">{product.nameAr}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{product.sku}</td>
                    <td className="px-4 py-3 text-slate-600">AED {product.basePrice}{product.salePrice ? <span className="text-green-600"> / {product.salePrice}</span> : ''}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {product.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-slate-600" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">{t('common.noData')}</div>
        )}
      </div>
    </div>
  )
}
