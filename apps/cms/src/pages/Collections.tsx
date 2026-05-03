import { useState } from 'react'
import { useTranslation } from '@repo/i18n'
import { useCollections, useCreateCollection, useUpdateCollection, useDeleteCollection } from '@repo/api-client'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { ImageUpload } from '@/components/ui'
import type { Collection } from '@repo/types'

export function CollectionsPage() {
  const { t } = useTranslation()
  const { data: collections, isLoading } = useCollections(true)
  const createCollection = useCreateCollection()
  const updateCollection = useUpdateCollection()
  const deleteCollection = useDeleteCollection()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [formData, setFormData] = useState({
    slug: '',
    nameEn: '',
    nameAr: '',
    descriptionEn: '',
    descriptionAr: '',
    imageUrl: '',
    isActive: true,
    showOnCollectionsPage: true,
    showInHeader: false,
    sortOrder: 0,
  })

  const openModal = (collection?: Collection) => {
    if (collection) {
      setEditingCollection(collection)
      setFormData({
        slug: collection.slug,
        nameEn: collection.nameEn,
        nameAr: collection.nameAr,
        descriptionEn: collection.descriptionEn || '',
        descriptionAr: collection.descriptionAr || '',
        imageUrl: collection.imageUrl || '',
        isActive: collection.isActive,
        showOnCollectionsPage: collection.showOnCollectionsPage,
        showInHeader: collection.showInHeader,
        sortOrder: collection.sortOrder,
      })
    } else {
      setEditingCollection(null)
      setFormData({
        slug: '',
        nameEn: '',
        nameAr: '',
        descriptionEn: '',
        descriptionAr: '',
        imageUrl: '',
        isActive: true,
        showOnCollectionsPage: true,
        showInHeader: false,
        sortOrder: collections?.length || 0,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCollection(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCollection) {
        await updateCollection.mutateAsync({ id: editingCollection.id, data: formData })
      } else {
        await createCollection.mutateAsync(formData)
      }
      closeModal()
    } catch (error) {
      console.error('Failed to save collection:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      await deleteCollection.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('collections.title')}</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('collections.addCollection')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections?.map((collection) => (
          <div
            key={collection.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            {collection.imageUrl ? (
              <img
                src={collection.imageUrl}
                alt={collection.nameEn}
                className="w-full object-cover"
              />
            ) : (
              <div className="w-full bg-slate-100 flex items-center justify-center">
                <span className="text-slate-400">{t('collections.noImage')}</span>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{collection.nameEn}</h3>
                  <p className="text-sm text-slate-500">{collection.nameAr}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    collection.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {collection.isActive ? t('common.active') : t('common.inactive')}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => openModal(collection)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => handleDelete(collection.id)}
                  className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!collections || collections.length === 0) && (
        <div className="bg-white rounded-xl p-8 text-center text-slate-500 border border-slate-200">
          {t('common.noData')}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingCollection ? t('collections.editCollection') : t('collections.addCollection')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('collections.nameEn')} *
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('collections.nameAr')} *
                  </label>
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('collections.slug')} *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  placeholder="new-arrivals"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('collections.descriptionEn')}
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('collections.descriptionAr')}
                  </label>
                  <textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    dir="rtl"
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('collections.image')}
                </label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">{t('common.active')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnCollectionsPage}
                    onChange={(e) => setFormData({ ...formData, showOnCollectionsPage: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">{t('collections.showOnCollectionsPage')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showInHeader}
                    onChange={(e) => setFormData({ ...formData, showInHeader: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">{t('collections.showInHeader')}</span>
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
                  disabled={createCollection.isPending || updateCollection.isPending}
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
