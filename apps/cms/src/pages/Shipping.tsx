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
    countries: 'UAE',
    cities: '',
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
        countries: zone.countries.join(', '),
        cities: zone.cities.join(', '),
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
        countries: 'UAE',
        cities: '',
        baseCost: 0,
        freeShippingMin: '',
        estimatedDaysMin: '',
        estimatedDaysMax: '',
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
      countries: formData.countries.split(',').map((c) => c.trim()).filter(Boolean),
      cities: formData.cities.split(',').map((c) => c.trim()).filter(Boolean),
      baseCost: formData.baseCost,
      freeShippingMin: formData.freeShippingMin ? parseFloat(formData.freeShippingMin) : undefined,
      estimatedDaysMin: formData.estimatedDaysMin ? parseInt(formData.estimatedDaysMin) : undefined,
      estimatedDaysMax: formData.estimatedDaysMax ? parseInt(formData.estimatedDaysMax) : undefined,
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
      console.error('Failed to save shipping zone:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
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
          {t('shipping.addZone')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones?.map((zone) => (
          <div
            key={zone.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">{zone.nameEn}</h3>
                <p className="text-sm text-slate-500">{zone.nameAr}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  zone.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {zone.isActive ? t('common.active') : t('common.inactive')}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('shipping.baseCost')}</span>
                <span className="font-medium">AED {zone.baseCost}</span>
              </div>
              {zone.freeShippingMin && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('shipping.freeShippingMin')}</span>
                  <span className="font-medium">AED {zone.freeShippingMin}+</span>
                </div>
              )}
              {zone.estimatedDaysMin && zone.estimatedDaysMax && (
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('shipping.estimatedDays')}</span>
                  <span className="font-medium">
                    {zone.estimatedDaysMin}-{zone.estimatedDaysMax} {t('shipping.days')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">{t('shipping.cities')}</span>
                <span className="font-medium text-right max-w-[150px] truncate">
                  {zone.cities.join(', ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => openModal(zone)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                {t('common.edit')}
              </button>
              <button
                onClick={() => handleDelete(zone.id)}
                className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(!zones || zones.length === 0) && (
        <div className="bg-white rounded-xl p-8 text-center text-slate-500 border border-slate-200">
          {t('common.noData')}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingZone ? t('shipping.editZone') : t('shipping.addZone')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('shipping.nameEn')} *
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
                    {t('shipping.nameAr')} *
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('shipping.countries')} *
                </label>
                <input
                  type="text"
                  value={formData.countries}
                  onChange={(e) => setFormData({ ...formData, countries: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  placeholder="UAE"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">{t('shipping.commaSeparated')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('shipping.cities')} *
                </label>
                <input
                  type="text"
                  value={formData.cities}
                  onChange={(e) => setFormData({ ...formData, cities: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  placeholder="Dubai, Abu Dhabi, Sharjah"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">{t('shipping.commaSeparated')}</p>
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
                  id="zoneActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="zoneActive" className="text-sm font-medium text-slate-700">
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
