import { useState } from 'react'
import { useTranslation } from '@repo/i18n'
import { Plus, Pencil, Trash2, Play } from 'lucide-react'
import { ImageUpload } from '@/components/ui'

interface ShoppableVideo {
  id: string
  titleEn: string | null
  titleAr: string | null
  videoUrl: string
  thumbnailUrl: string
  sortOrder: number
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

export function VideosPage() {
  const { t } = useTranslation()
  const [videos, setVideos] = useState<ShoppableVideo[]>([])
  const [isLoading] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<ShoppableVideo | null>(null)
  const [formData, setFormData] = useState({
    titleEn: '',
    titleAr: '',
    videoUrl: '',
    thumbnailUrl: '',
    sortOrder: 0,
    status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
  })

  const openModal = (video?: ShoppableVideo) => {
    if (video) {
      setEditingVideo(video)
      setFormData({
        titleEn: video.titleEn || '',
        titleAr: video.titleAr || '',
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        sortOrder: video.sortOrder,
        status: video.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
      })
    } else {
      setEditingVideo(null)
      setFormData({
        titleEn: '',
        titleAr: '',
        videoUrl: '',
        thumbnailUrl: '',
        sortOrder: videos.length,
        status: 'PUBLISHED',
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingVideo(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    closeModal()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      setVideos(videos.filter((v) => v.id !== id))
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('content.videos.title')}</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('content.videos.addVideo')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="relative aspect-video">
              <img
                src={video.thumbnailUrl}
                alt={video.titleEn || ''}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-slate-900 ml-1" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-900">
                {video.titleEn || t('content.videos.untitled')}
              </h3>
              {video.titleAr && (
                <p className="text-sm text-slate-500">{video.titleAr}</p>
              )}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => openModal(video)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  {t('common.edit')}
                </button>
                <button
                  onClick={() => handleDelete(video.id)}
                  className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center text-slate-500 border border-slate-200">
          {t('common.noData')}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingVideo ? t('content.videos.editVideo') : t('content.videos.addVideo')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('content.videos.titleEn')}
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('content.videos.titleAr')}
                  </label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('content.videos.video')} URL *
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  placeholder="https://..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('content.videos.thumbnail')} *
                </label>
                <ImageUpload
                  value={formData.thumbnailUrl}
                  onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                />
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
                  className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
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
