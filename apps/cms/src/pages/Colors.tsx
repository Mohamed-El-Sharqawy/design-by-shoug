import { useState } from 'react'
import { useTranslation } from '@repo/i18n'
import { useColors, useCreateColor, useUpdateColor, useDeleteColor } from '@repo/api-client'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Color } from '@repo/types'

export function ColorsPage() {
  const { t } = useTranslation()
  const { data: colors, isLoading } = useColors(true)
  const createColor = useCreateColor()
  const updateColor = useUpdateColor()
  const deleteColor = useDeleteColor()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingColor, setEditingColor] = useState<Color | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    nameEn: '',
    nameAr: '',
    hexCode: '',
    isActive: true,
    sortOrder: 0,
  })

  const openModal = (color?: Color) => {
    if (color) {
      setEditingColor(color)
      setFormData({
        code: color.code,
        nameEn: color.nameEn,
        nameAr: color.nameAr,
        hexCode: color.hexCode || '',
        isActive: color.isActive,
        sortOrder: color.sortOrder,
      })
    } else {
      setEditingColor(null)
      setFormData({
        code: '',
        nameEn: '',
        nameAr: '',
        hexCode: '',
        isActive: true,
        sortOrder: colors?.length || 0,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingColor(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      code: formData.code,
      nameEn: formData.nameEn,
      nameAr: formData.nameAr,
      hexCode: formData.hexCode || undefined,
      isActive: formData.isActive,
      sortOrder: formData.sortOrder,
    }

    try {
      if (editingColor) {
        await updateColor.mutateAsync({ id: editingColor.id, data })
      } else {
        await createColor.mutateAsync(data)
      }
      closeModal()
    } catch (err: unknown) {
      console.error('Failed to save color:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      await deleteColor.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('colors.title')}</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('colors.addColor')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {colors && colors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('colors.color')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('colors.code')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('colors.nameEn')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('colors.nameAr')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('common.sort')}</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('common.status')}</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {colors.map((color: Color) => (
                  <tr key={color.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-8 h-8 rounded-lg border border-slate-300"
                          style={{ backgroundColor: color.hexCode || '#ccc' }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">{color.code}</td>
                    <td className="px-4 py-3 text-slate-700">{color.nameEn}</td>
                    <td className="px-4 py-3 text-slate-700" dir="rtl">{color.nameAr}</td>
                    <td className="px-4 py-3 text-slate-600">{color.sortOrder}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          color.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {color.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(color)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(color.id)}
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
              {editingColor ? t('colors.editColor') : t('colors.addColor')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('colors.code')} *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none font-mono"
                    placeholder="BLK"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('colors.hexCode')}</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.hexCode || '#000000'}
                      onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
                      className="w-10 h-10 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.hexCode}
                      onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('colors.nameEn')} *</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('colors.nameAr')} *</label>
                  <input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    dir="rtl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('colors.sortOrder')}</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">{t('common.active')}</span>
                  </label>
                </div>
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
                  disabled={createColor.isPending || updateColor.isPending}
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
