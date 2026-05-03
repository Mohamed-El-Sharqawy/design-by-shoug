import { useState } from 'react'
import { useTranslation } from '@repo/i18n'
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '@repo/api-client'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Coupon, CouponType } from '@repo/types'

const couponTypes: CouponType[] = ['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']

export function CouponsPage() {
  const { t } = useTranslation()
  const { data: coupons, isLoading } = useCoupons()
  const createCoupon = useCreateCoupon()
  const updateCoupon = useUpdateCoupon()
  const deleteCoupon = useDeleteCoupon()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    descriptionEn: '',
    descriptionAr: '',
    type: 'PERCENTAGE' as CouponType,
    value: 0,
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    expiresAt: '',
    isActive: true,
  })

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        code: coupon.code,
        descriptionEn: coupon.descriptionEn || '',
        descriptionAr: coupon.descriptionAr || '',
        type: coupon.type,
        value: coupon.value,
        minOrderAmount: coupon.minOrderAmount?.toString() || '',
        maxDiscount: coupon.maxDiscount?.toString() || '',
        usageLimit: coupon.usageLimit?.toString() || '',
        expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
        isActive: coupon.isActive,
      })
    } else {
      setEditingCoupon(null)
      setFormData({
        code: '',
        descriptionEn: '',
        descriptionAr: '',
        type: 'PERCENTAGE',
        value: 0,
        minOrderAmount: '',
        maxDiscount: '',
        usageLimit: '',
        expiresAt: '',
        isActive: true,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCoupon(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      code: formData.code,
      descriptionEn: formData.descriptionEn || undefined,
      descriptionAr: formData.descriptionAr || undefined,
      type: formData.type,
      value: formData.value,
      minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      expiresAt: formData.expiresAt || undefined,
      isActive: formData.isActive,
    }

    try {
      if (editingCoupon) {
        await updateCoupon.mutateAsync({ id: editingCoupon.id, data })
      } else {
        await createCoupon.mutateAsync(data)
      }
      closeModal()
    } catch (error) {
      console.error('Failed to save coupon:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      await deleteCoupon.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('coupons.title')}</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('coupons.addCoupon')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {coupons && coupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    {t('coupons.code')}
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    {t('coupons.type')}
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    {t('coupons.value')}
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    {t('coupons.usageCount')}
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    {t('coupons.expiresAt')}
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
                {coupons.map((coupon: Coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">
                      {coupon.code}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {t(`coupons.${coupon.type.toLowerCase()}`)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {coupon.type === 'PERCENTAGE'
                        ? `${coupon.value}%`
                        : coupon.type === 'FIXED_AMOUNT'
                        ? `AED ${coupon.value}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {coupon.usageCount}
                      {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          coupon.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {coupon.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(coupon)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingCoupon ? t('coupons.editCoupon') : t('coupons.addCoupon')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('coupons.code')} *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none font-mono"
                  placeholder="SUMMER20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('coupons.type')} *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CouponType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  >
                    {couponTypes.map((type) => (
                      <option key={type} value={type}>
                        {t(`coupons.${type.toLowerCase()}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('coupons.value')} *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    min="0"
                    step={formData.type === 'PERCENTAGE' ? '1' : '0.01'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('coupons.minOrder')}
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('coupons.maxDiscount')}
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    min="0"
                    step="0.01"
                    placeholder={t('coupons.noLimit')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('coupons.usageLimit')}
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    min="0"
                    placeholder={t('coupons.unlimited')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('coupons.expiresAt')}
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                  {t('common.active')}
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createCoupon.isPending || updateCoupon.isPending}
                  className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
