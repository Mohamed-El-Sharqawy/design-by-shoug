import { useState } from 'react'
import { useTranslation } from '@repo/i18n'
import { useInstagramPosts, useCreateInstagramPost, useUpdateInstagramPost, useDeleteInstagramPost, useUploadImage } from '@repo/api-client'
import { ImageUpload } from '@/components/ui'
import { Plus, Pencil, Trash2, ExternalLink, Loader2 } from 'lucide-react'
import type { InstagramPost } from '@repo/types'

export function InstagramPage() {
  const { t } = useTranslation()
  const { data: posts, isLoading } = useInstagramPosts(true)
  const createPost = useCreateInstagramPost()
  const updatePost = useUpdateInstagramPost()
  const deletePost = useDeleteInstagramPost()
  const uploadImage = useUploadImage()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null)
  const [formData, setFormData] = useState({
    postUrl: '',
    imageUrl: '',
    captionEn: '',
    captionAr: '',
    sortOrder: 0,
    status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
  })

  const openModal = (post?: InstagramPost) => {
    if (post) {
      setEditingPost(post)
      setFormData({
        postUrl: post.postUrl,
        imageUrl: post.imageUrl,
        captionEn: post.captionEn || '',
        captionAr: post.captionAr || '',
        sortOrder: post.sortOrder,
        status: post.status,
      })
    } else {
      setEditingPost(null)
      setFormData({
        postUrl: '',
        imageUrl: '',
        captionEn: '',
        captionAr: '',
        sortOrder: posts?.length || 0,
        status: 'PUBLISHED',
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPost(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      postUrl: formData.postUrl,
      imageUrl: formData.imageUrl,
      captionEn: formData.captionEn || undefined,
      captionAr: formData.captionAr || undefined,
      sortOrder: formData.sortOrder,
      status: formData.status,
    }

    try {
      if (editingPost) {
        await updatePost.mutateAsync({ id: editingPost.id, data })
      } else {
        await createPost.mutateAsync(data)
      }
      closeModal()
    } catch (err: unknown) {
      console.error('Failed to save instagram post:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      await deletePost.mutateAsync(id)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-700'
      case 'DRAFT': return 'bg-yellow-100 text-yellow-700'
      case 'ARCHIVED': return 'bg-gray-100 text-gray-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  const isPending = createPost.isPending || updatePost.isPending

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('content.instagram.title')}</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('content.instagram.addPost')}
        </button>
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group"
            >
              <div className="relative aspect-square">
                <img
                  src={post.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white rounded-full hover:bg-slate-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => openModal(post)}
                    className="p-2 bg-white rounded-full hover:bg-slate-100"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 bg-white rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <div className="absolute top-2 left-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusBadge(post.status)}`}>
                    {post.status}
                  </span>
                </div>
              </div>
              {(post.captionEn || post.captionAr) && (
                <div className="p-3">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {post.captionEn || post.captionAr}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 text-center text-slate-500 border border-slate-200">
          {t('common.noData')}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingPost ? t('content.instagram.editPost') : t('content.instagram.addPost')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('content.instagram.postUrl')} *
                </label>
                <input
                  type="url"
                  value={formData.postUrl}
                  onChange={(e) => setFormData({ ...formData, postUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  placeholder="https://instagram.com/p/..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('content.instagram.image')} *
                </label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  onUpload={async (file) => {
                    const result = await uploadImage.mutateAsync({ file, folder: 'instagram' })
                    return result.url
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('content.instagram.captionEn')}
                  </label>
                  <textarea
                    value={formData.captionEn}
                    onChange={(e) => setFormData({ ...formData, captionEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('content.instagram.captionAr')}
                  </label>
                  <textarea
                    value={formData.captionAr}
                    onChange={(e) => setFormData({ ...formData, captionAr: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    dir="rtl"
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  />
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
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
