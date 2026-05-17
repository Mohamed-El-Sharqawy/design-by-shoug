import { useState } from 'react'
import { useTranslation } from '@repo/i18n'
import { useShippingZones, useCreateShippingZone, useUpdateShippingZone, useDeleteShippingZone } from '@repo/api-client'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { ShippingZone } from '@repo/types'

export function ShippingPage() {
  const { t } = useTranslation()
  const { data: zones, isLoading } = useShippingZones()
  const createZone = useCreateShippingZone()
  const updateZone = useUpdateShippingZone()
  const deleteZone = useDeleteShippingZone()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null)
  const [formData, setFormData] = useState({
    nameEn: '',
    nameAr: '',
    baseCost: 0,
    freeShippingMin: '',
    estimatedDaysMin: '',
    estimatedDaysMax: '',
    isActive: true,
  })

  const openModal = (zone?: ShippingZone) => {
    if (zone) {
      setEditingZone(zone)
      setFormData({
        nameEn: zone.nameEn,
        nameAr: zone.nameAr,
        baseCost: zone.baseCost,
        freeShippingMin: zone.freeShippingMin?.toString() || '',
        estimatedDaysMin: zone.estimatedDaysMin?.toString() || '',
        estimatedDaysMax: zone.estimatedDaysMax?.toString() || '',
        isActive: zone.isActive,
      })
    } else {
      setEditingZone(null)
      setFormData({
        nameEn: '',
        nameAr: '',
        baseCost: 0,
        freeShippingMin: '1000',
        estimatedDaysMin: '1',
        estimatedDaysMax: '3',
        isActive: true,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingZone(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      nameEn: formData.nameEn,
      nameAr: formData.nameAr,
      countries: ['AE'],
      cities: [formData.nameEn],
      baseCost: Number(formData.baseCost) || 0,
      freeShippingMin: formData.freeShippingMin ? Number(formData.freeShippingMin) : undefined,
      estimatedDaysMin: formData.estimatedDaysMin ? parseInt(String(formData.estimatedDaysMin)) : undefined,
      estimatedDaysMax: formData.estimatedDaysMax ? parseInt(String(formData.estimatedDaysMax)) : undefined,
      isActive: formData.isActive,
    }

    try {
      if (editingZone) {
        await updateZone.mutateAsync({ id: editingZone.id, data })
      } else {
        await createZone.mutateAsync(data)
      }
      closeModal()
    } catch (error) {
      console.error('Failed to save shipping city:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('shipping.confirmDelete'))) {
      await deleteZone.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('shipping.title')}</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('shipping.addCity')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t('shipping.cityNameEn')}
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t('shipping.cityNameAr')}
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t('shipping.baseCost')} (AED)
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t('shipping.freeShippingMin')} (AED)
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t('shipping.estimatedDays')}
              </th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t('common.active')}
              </th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {zones?.map((zone) => (
              <tr key={zone.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-900">{zone.nameEn}</span>
                </td>
                <td className="px-6 py-4 text-slate-700" dir="rtl">
                  {zone.nameAr}
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-900">AED {zone.baseCost}</span>
                </td>
                <td className="px-6 py-4">
                  {zone.freeShippingMin ? (
                    <span className="font-medium text-emerald-600">AED {zone.freeShippingMin}+</span>
                  ) : (
                    <span className="text-slate-400">{t('shipping.noFreeShipping')}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {zone.estimatedDaysMin && zone.estimatedDaysMax
                    ? `${zone.estimatedDaysMin}-${zone.estimatedDaysMax} ${t('shipping.days')}`
                    : '—'}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      zone.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {zone.isActive ? t('common.active') : t('common.inactive')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openModal(zone)}
                      className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                      title={t('common.edit')}
                    >
                      <Pencil className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(zone.id)}
                      className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!zones || zones.length === 0) && (
          <div className="p-8 text-center text-slate-500">
            {t('common.noData')}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingZone ? t('shipping.editCity') : t('shipping.addCity')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('shipping.cityNameEn')} *
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    placeholder="Dubai"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('shipping.cityNameAr')} *
                  </label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    dir="rtl"
                    placeholder="دبي"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('shipping.baseCost')} (AED) *
                  </label>
                  <input
                    type="number"
                    value={formData.baseCost}
                    onChange={(e) => setFormData({ ...formData, baseCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('shipping.freeShippingMin')} (AED)
                  </label>
                  <input
                    type="number"
                    value={formData.freeShippingMin}
                    onChange={(e) => setFormData({ ...formData, freeShippingMin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    min="0"
                    step="0.01"
                    placeholder={t('shipping.noFreeShipping')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('shipping.minDays')}
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedDaysMin}
                    onChange={(e) => setFormData({ ...formData, estimatedDaysMin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    min="1"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('shipping.maxDays')}
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedDaysMax}
                    onChange={(e) => setFormData({ ...formData, estimatedDaysMax: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    min="1"
                    placeholder="3"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cityActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="cityActive" className="text-sm font-medium text-slate-700">
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
                  disabled={createZone.isPending || updateZone.isPending}
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
