import { useState } from 'react'
import { useTranslation } from '@repo/i18n'
import { useBodySizes, useCreateBodySize, useUpdateBodySize, useDeleteBodySize } from '@repo/api-client'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { BodySize } from '@repo/types'

export function BodySizesPage() {
  const { t } = useTranslation()
  const { data: sizes, isLoading } = useBodySizes(true)
  const createSize = useCreateBodySize()
  const updateSize = useUpdateBodySize()
  const deleteSize = useDeleteBodySize()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSize, setEditingSize] = useState<BodySize | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    labelEn: '',
    labelAr: '',
    bustInches: 0,
    hipInches: 0,
    sleevesInches: '',
    isActive: true,
    sortOrder: 0,
  })

  const openModal = (size?: BodySize) => {
    if (size) {
      setEditingSize(size)
      setFormData({
        code: size.code,
        labelEn: size.labelEn,
        labelAr: size.labelAr,
        bustInches: Number(size.bustInches),
        hipInches: Number(size.hipInches),
        sleevesInches: size.sleevesInches?.toString() || '',
        isActive: size.isActive,
        sortOrder: size.sortOrder,
      })
    } else {
      setEditingSize(null)
      setFormData({
        code: '',
        labelEn: '',
        labelAr: '',
        bustInches: 0,
        hipInches: 0,
        sleevesInches: '',
        isActive: true,
        sortOrder: sizes?.length || 0,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingSize(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      code: formData.code,
      labelEn: formData.labelEn,
      labelAr: formData.labelAr,
      bustInches: formData.bustInches,
      hipInches: formData.hipInches,
      sleevesInches: formData.sleevesInches ? parseFloat(formData.sleevesInches) : undefined,
      isActive: formData.isActive,
      sortOrder: formData.sortOrder,
    }

    try {
      if (editingSize) {
        await updateSize.mutateAsync({ id: editingSize.id, data })
      } else {
        await createSize.mutateAsync(data)
      }
      closeModal()
    } catch (err: unknown) {
      console.error('Failed to save body size:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      await deleteSize.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('bodySizes.title')}</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('bodySizes.addSize')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {sizes && sizes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('bodySizes.code')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('bodySizes.labelEn')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('bodySizes.labelAr')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('bodySizes.bustInches')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('bodySizes.hipInches')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('bodySizes.sleevesInches')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('common.sort')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('common.status')}</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sizes.map((size: BodySize) => (
                  <tr key={size.id} className="hover:bg-slate-50">
                    <td className="text-left px-4 py-3 font-mono font-medium text-slate-900">{size.code}</td>
                    <td className="text-left px-4 py-3 text-slate-700">{size.labelEn}</td>
                    <td className="text-left px-4 py-3 text-slate-700" dir="rtl">{size.labelAr}</td>
                    <td className="text-left px-4 py-3 text-slate-600">{size.bustInches}"</td>
                    <td className="text-left px-4 py-3 text-slate-600">{size.hipInches}"</td>
                    <td className="text-left px-4 py-3 text-slate-600">{size.sleevesInches ? `${size.sleevesInches}"` : '-'}</td>
                    <td className="text-left px-4 py-3 text-slate-600">{size.sortOrder}</td>
                    <td className="text-left px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          size.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {size.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="text-right px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(size)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(size.id)}
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
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingSize ? t('bodySizes.editSize') : t('bodySizes.addSize')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('bodySizes.code')} *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none font-mono"
                    placeholder="XL"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('bodySizes.sortOrder')}</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('bodySizes.labelEn')} *</label>
                  <input
                    type="text"
                    value={formData.labelEn}
                    onChange={(e) => setFormData({ ...formData, labelEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('bodySizes.labelAr')} *</label>
                  <input
                    type="text"
                    value={formData.labelAr}
                    onChange={(e) => setFormData({ ...formData, labelAr: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    dir="rtl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('bodySizes.bustInches')} *</label>
                  <input
                    type="number"
                    value={formData.bustInches}
                    onChange={(e) => setFormData({ ...formData, bustInches: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    step="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('bodySizes.hipInches')} *</label>
                  <input
                    type="number"
                    value={formData.hipInches}
                    onChange={(e) => setFormData({ ...formData, hipInches: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    step="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('bodySizes.sleevesInches')}</label>
                  <input
                    type="number"
                    value={formData.sleevesInches}
                    onChange={(e) => setFormData({ ...formData, sleevesInches: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">{t('common.active')}</span>
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
                  disabled={createSize.isPending || updateSize.isPending}
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
