import { useState } from 'react'
import { useTranslation } from '@repo/i18n'
import { useCustomerReviews, useCreateCustomerReview, useUpdateCustomerReview, useDeleteCustomerReview, useProducts, useUploadImage, useUploadVideo } from '@repo/api-client'
import { ImageUpload } from '@/components/ui'
import { Plus, Pencil, Trash2, Star, Play, Film } from 'lucide-react'
import type { CustomerReview, ReviewerType } from '@repo/types'

export function CustomerReviewsPage() {
  const { t } = useTranslation()
  const { data: reviews, isLoading } = useCustomerReviews(true)
  const { data: productsData } = useProducts()
  const createReview = useCreateCustomerReview()
  const updateReview = useUpdateCustomerReview()
  const deleteReview = useDeleteCustomerReview()
  const uploadImage = useUploadImage()
  const uploadVideo = useUploadVideo()

  const products = productsData?.products || []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null)
  const [formData, setFormData] = useState({
    videoUrl: '',
    thumbnailUrl: '',
    name: '',
    type: 'CUSTOMER' as ReviewerType,
    productId: '',
    feedbackEn: '',
    feedbackAr: '',
    rating: 5,
    sortOrder: 0,
    isActive: true,
    reviewDate: new Date().toISOString().split('T')[0],
  })

  const openModal = (review?: CustomerReview) => {
    if (review) {
      setEditingReview(review)
      setFormData({
        videoUrl: review.videoUrl,
        thumbnailUrl: review.thumbnailUrl || '',
        name: review.name,
        type: review.type,
        productId: review.productId || '',
        feedbackEn: review.feedbackEn || '',
        feedbackAr: review.feedbackAr || '',
        rating: review.rating,
        sortOrder: review.sortOrder,
        isActive: review.isActive,
        reviewDate: new Date(review.reviewDate).toISOString().split('T')[0],
      })
    } else {
      setEditingReview(null)
      setFormData({
        videoUrl: '',
        thumbnailUrl: '',
        name: '',
        type: 'CUSTOMER',
        productId: '',
        feedbackEn: '',
        feedbackAr: '',
        rating: 5,
        sortOrder: reviews?.length || 0,
        isActive: true,
        reviewDate: new Date().toISOString().split('T')[0],
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingReview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      videoUrl: formData.videoUrl,
      thumbnailUrl: formData.thumbnailUrl || undefined,
      name: formData.name,
      type: formData.type,
      productId: formData.productId || undefined,
      feedbackEn: formData.feedbackEn || undefined,
      feedbackAr: formData.feedbackAr || undefined,
      rating: formData.rating,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
      reviewDate: formData.reviewDate,
    }

    try {
      if (editingReview) {
        await updateReview.mutateAsync({ id: editingReview.id, data })
      } else {
        await createReview.mutateAsync(data)
      }
      closeModal()
    } catch (err: unknown) {
      console.error('Failed to save customer review:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      await deleteReview.mutateAsync(id)
    }
  }

  const getTypeLabel = (type: ReviewerType) => {
    switch (type) {
      case 'MODEL': return t('customerReviews.typeModel')
      case 'INFLUENCER': return t('customerReviews.typeInfluencer')
      default: return t('customerReviews.typeCustomer')
    }
  }

  const getTypeBadgeColor = (type: ReviewerType) => {
    switch (type) {
      case 'MODEL': return 'bg-purple-100 text-purple-700'
      case 'INFLUENCER': return 'bg-pink-100 text-pink-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('customerReviews.title')}</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('customerReviews.addReview')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {reviews && reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {reviews.map((review: CustomerReview) => (
              <div key={review.id} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                {/* Video Thumbnail */}
                <div className="relative aspect-9/16 bg-slate-100">
                  {review.thumbnailUrl ? (
                    <img
                      src={review.thumbnailUrl}
                      alt={review.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                      <Play className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-slate-700 ml-1" />
                    </div>
                  </div>
                  {!review.isActive && (
                    <div className="absolute top-2 right-2 bg-slate-900/70 text-white text-xs px-2 py-1 rounded">
                      {t('common.inactive')}
                    </div>
                  )}
                </div>

                {/* Review Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-slate-900">{review.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeBadgeColor(review.type)}`}>
                      {getTypeLabel(review.type)}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>

                  {review.feedbackEn && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">"{review.feedbackEn}"</p>
                  )}

                  <p className="text-xs text-slate-400">
                    {new Date(review.reviewDate).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => openModal(review)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                    >
                      <Pencil className="w-4 h-4" />
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">{t('common.noData')}</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingReview ? t('customerReviews.editReview') : t('customerReviews.addReview')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Video & Thumbnail Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('customerReviews.videoUrl')} *</label>
                  {formData.videoUrl ? (
                    <div className="relative group">
                      <video
                        src={formData.videoUrl}
                        className="w-full h-48 object-cover rounded-lg border border-slate-200"
                        muted
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, videoUrl: '' })}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col items-center justify-center py-6">
                        {uploadVideo.isPending ? (
                          <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Film className="w-10 h-10 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-500">Click to upload video</p>
                            <p className="text-xs text-slate-400 mt-1">MP4, MOV, WebM up to 50MB</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          try {
                            const result = await uploadVideo.mutateAsync({ file, folder: 'reviews' })
                            setFormData({ ...formData, videoUrl: result.url })
                          } catch (err) {
                            console.error('Failed to upload video:', err)
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                  <div className="mt-2">
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm"
                      placeholder="Or paste video URL..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('customerReviews.thumbnailUrl')}</label>
                  <ImageUpload
                    value={formData.thumbnailUrl}
                    onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                    onUpload={async (file) => {
                      const result = await uploadImage.mutateAsync({ file, folder: "videos" })
                      return result.url
                    }}
                  />
                </div>
              </div>

              {/* Name & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('customerReviews.name')} *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('customerReviews.type')}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ReviewerType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  >
                    <option value="CUSTOMER">{t('customerReviews.typeCustomer')}</option>
                    <option value="MODEL">{t('customerReviews.typeModel')}</option>
                    <option value="INFLUENCER">{t('customerReviews.typeInfluencer')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('customerReviews.product')}</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                >
                  <option value="">{t('customerReviews.selectProduct')}</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('customerReviews.feedbackEn')}</label>
                  <textarea
                    value={formData.feedbackEn}
                    onChange={(e) => setFormData({ ...formData, feedbackEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('customerReviews.feedbackAr')}</label>
                  <textarea
                    value={formData.feedbackAr}
                    onChange={(e) => setFormData({ ...formData, feedbackAr: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none resize-none"
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Rating, Date, Sort Order */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('customerReviews.rating')}</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('customerReviews.reviewDate')}</label>
                  <input
                    type="date"
                    value={formData.reviewDate}
                    onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('customerReviews.sortOrder')}</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">{t('common.active')}</span>
              </div>

              {/* Actions */}
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
                  disabled={createReview.isPending || updateReview.isPending}
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
