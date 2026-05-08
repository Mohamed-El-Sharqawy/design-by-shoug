import { useState } from 'react'
import { useTranslation } from '@repo/i18n'
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, useUploadImage } from '@repo/api-client'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
import { ImageUpload } from '@/components/ui'
import type { Banner } from '@repo/types'

export function BannersPage() {
  const { t } = useTranslation()
  const { data: banners, isLoading } = useBanners()
  const createBanner = useCreateBanner()
  const updateBanner = useUpdateBanner()
  const deleteBanner = useDeleteBanner()
  const uploadImage = useUploadImage()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState({
    imageUrl: '',
    imageMobileUrl: '',
    buttonTextEn: '',
    buttonTextAr: '',
    href: '',
    sortOrder: 0,
    isActive: true,
  })

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner)
      setFormData({
        imageUrl: banner.imageUrl,
        imageMobileUrl: banner.imageMobileUrl || '',
        buttonTextEn: banner.buttonTextEn || '',
        buttonTextAr: banner.buttonTextAr || '',
        href: banner.href || '',
        sortOrder: banner.sortOrder,
        isActive: banner.isActive,
      })
    } else {
      setEditingBanner(null)
      setFormData({
        imageUrl: '',
        imageMobileUrl: '',
        buttonTextEn: '',
        buttonTextAr: '',
        href: '',
        sortOrder: banners?.length || 0,
        isActive: true,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBanner(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingBanner) {
        await updateBanner.mutateAsync({ id: editingBanner.id, data: formData })
      } else {
        await createBanner.mutateAsync(formData)
      }
      closeModal()
    } catch (error) {
      console.error('Failed to save banner:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      await deleteBanner.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('content.banners.title')}
        </h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('content.banners.addBanner')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {banners && banners.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="flex items-center gap-4 p-4 hover:bg-slate-50"
              >
                <GripVertical className="w-5 h-5 text-slate-400 cursor-grab" />
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <img src={banner.imageUrl} alt="Desktop" className="w-32 h-20 object-cover rounded-lg" />
                    <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[8px] px-1 rounded">16:9</span>
                  </div>
                  {banner.imageMobileUrl && (
                    <div className="relative">
                      <img src={banner.imageMobileUrl} alt="Mobile" className="w-12 h-20 object-cover rounded-lg" />
                      <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[8px] px-1 rounded">9:16</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    {banner.buttonTextEn || t('content.banners.noButtonText')}
                  </p>
                  <p className="text-sm text-slate-500">{banner.href || t('content.banners.noLink')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      banner.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {banner.isActive ? t('common.active') : t('common.inactive')}
                  </span>
                  <button
                    onClick={() => openModal(banner)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            {t('common.noData')}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingBanner
                ? t('content.banners.editBanner')
                : t('content.banners.addBanner')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('content.banners.image')} (16:9) *
                  </label>
                  <ImageUpload
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    onUpload={async (file) => {
                      const result = await uploadImage.mutateAsync({ file, folder: 'banners' })
                      return result.url
                    }}
                  />
                  <p className="text-xs text-slate-400 mt-1">Desktop / Landscape</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('content.banners.image')} (9:16)
                  </label>
                  <ImageUpload
                    value={formData.imageMobileUrl}
                    onChange={(url) => setFormData({ ...formData, imageMobileUrl: url })}
                    onUpload={async (file) => {
                      const result = await uploadImage.mutateAsync({ file, folder: 'banners' })
                      return result.url
                    }}
                  />
                  <p className="text-xs text-slate-400 mt-1">Mobile / Portrait</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('content.banners.buttonTextEn')}
                  </label>
                  <input
                    type="text"
                    value={formData.buttonTextEn}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonTextEn: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('content.banners.buttonTextAr')}
                  </label>
                  <input
                    type="text"
                    value={formData.buttonTextAr}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonTextAr: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    dir="rtl"
                    placeholder="تسوق الآن"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('content.banners.link')}
                </label>
                <input
                  value={formData.href}
                  onChange={(e) =>
                    setFormData({ ...formData, href: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  placeholder="/collections/new-arrivals"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('content.banners.sortOrder')}
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {t('common.active')}
                    </span>
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
                  disabled={createBanner.isPending || updateBanner.isPending}
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
