import { useState } from 'react'
import { useTranslation } from '@repo/i18n'
import { useAbayaLengths, useCreateAbayaLength, useUpdateAbayaLength, useDeleteAbayaLength } from '@repo/api-client'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { AbayaLength } from '@repo/types'

export function AbayaLengthsPage() {
  const { t } = useTranslation()
  const { data: lengths, isLoading } = useAbayaLengths(true)
  const createLength = useCreateAbayaLength()
  const updateLength = useUpdateAbayaLength()
  const deleteLength = useDeleteAbayaLength()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLength, setEditingLength] = useState<AbayaLength | null>(null)
  const [formData, setFormData] = useState({
    inches: 0,
    labelEn: '',
    labelAr: '',
    idealHeightCm: 0,
    idealHeightFt: '',
    isActive: true,
    sortOrder: 0,
  })

  const openModal = (length?: AbayaLength) => {
    if (length) {
      setEditingLength(length)
      setFormData({
        inches: length.inches,
        labelEn: length.labelEn,
        labelAr: length.labelAr,
        idealHeightCm: Number(length.idealHeightCm),
        idealHeightFt: length.idealHeightFt,
        isActive: length.isActive,
        sortOrder: length.sortOrder,
      })
    } else {
      setEditingLength(null)
      setFormData({
        inches: 0,
        labelEn: '',
        labelAr: '',
        idealHeightCm: 0,
        idealHeightFt: '',
        isActive: true,
        sortOrder: lengths?.length || 0,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingLength(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      inches: formData.inches,
      labelEn: formData.labelEn,
      labelAr: formData.labelAr,
      idealHeightCm: formData.idealHeightCm,
      idealHeightFt: formData.idealHeightFt,
      isActive: formData.isActive,
      sortOrder: formData.sortOrder,
    }

    try {
      if (editingLength) {
        await updateLength.mutateAsync({ id: editingLength.id, data })
      } else {
        await createLength.mutateAsync(data)
      }
      closeModal()
    } catch (err: unknown) {
      console.error('Failed to save abaya length:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      await deleteLength.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('abayaLengths.title')}</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('abayaLengths.addLength')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {lengths && lengths.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('abayaLengths.inches')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('abayaLengths.labelEn')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('abayaLengths.labelAr')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('abayaLengths.idealHeightCm')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('abayaLengths.idealHeightFt')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('common.sort')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('common.status')}</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {lengths.map((length: AbayaLength) => (
                  <tr key={length.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{length.inches}"</td>
                    <td className="px-4 py-3 text-slate-700">{length.labelEn}</td>
                    <td className="px-4 py-3 text-slate-700" dir="rtl">{length.labelAr}</td>
                    <td className="px-4 py-3 text-slate-600">{length.idealHeightCm} cm</td>
                    <td className="px-4 py-3 text-slate-600">{length.idealHeightFt}</td>
                    <td className="px-4 py-3 text-slate-600">{length.sortOrder}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          length.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {length.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(length)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(length.id)}
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
              {editingLength ? t('abayaLengths.editLength') : t('abayaLengths.addLength')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('abayaLengths.inches')} *</label>
                  <input
                    type="number"
                    value={formData.inches}
                    onChange={(e) => setFormData({ ...formData, inches: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('abayaLengths.sortOrder')}</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('abayaLengths.labelEn')} *</label>
                  <input
                    type="text"
                    value={formData.labelEn}
                    onChange={(e) => setFormData({ ...formData, labelEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    placeholder='52"'
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('abayaLengths.labelAr')} *</label>
                  <input
                    type="text"
                    value={formData.labelAr}
                    onChange={(e) => setFormData({ ...formData, labelAr: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    dir="rtl"
                    placeholder='٥٢"'
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('abayaLengths.idealHeightCm')} *</label>
                  <input
                    type="number"
                    value={formData.idealHeightCm}
                    onChange={(e) => setFormData({ ...formData, idealHeightCm: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('abayaLengths.idealHeightFt')} *</label>
                  <input
                    type="text"
                    value={formData.idealHeightFt}
                    onChange={(e) => setFormData({ ...formData, idealHeightFt: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    placeholder={"5'4\""}
                    required
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
                  disabled={createLength.isPending || updateLength.isPending}
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
