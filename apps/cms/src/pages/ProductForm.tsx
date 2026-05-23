import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from '@repo/i18n'
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useColors,
  useAbayaLengths,
  useCollections,
  useUploadImage,
} from '@repo/api-client'
import { ImageUpload, RichTextEditor } from '@/components/ui'
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import type { Color } from '@repo/types'

interface VariantRow {
  id: string
  abayaLengthId: string
  colorId: string
  sku: string
  priceAdjustment: number
  stock: number
}

type Step = 'details' | 'metadata' | 'variants'

export function ProductFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const { data: product, isLoading } = useProduct(id || '')
  const { data: colorsData } = useColors(true)
  const { data: lengthsData } = useAbayaLengths(true)
  const { data: collectionsData } = useCollections(true)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const uploadImage = useUploadImage()

  const colors = colorsData || []
  const lengths = lengthsData || []
  const allCollections = collectionsData || []

  const [step, setStep] = useState<Step>('details')
  const [submitting, setSubmitting] = useState(false)
  const isSaving = useRef(false)

  const [form, setForm] = useState({
    sku: '',
    slug: '',
    nameEn: '',
    nameAr: '',
    descriptionEn: '',
    descriptionAr: '',
    shortDescEn: '',
    shortDescAr: '',
    basePrice: '',
    salePrice: '',
    costPrice: '',
    hasColorOptions: false,
    productType: 'ABAYA' as 'ABAYA' | 'SIMPLE',
    isFeatured: false,
    isActive: true,
    isNewArrival: false,
    collectionIds: [] as string[],
    metaTitleEn: '',
    metaTitleAr: '',
    metaDescEn: '',
    metaDescAr: '',
  })

  const [images, setImages] = useState<{ url: string; altTextEn: string; altTextAr: string; isPrimary: boolean }[]>([])
  const [selectedLengths, setSelectedLengths] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [variants, setVariants] = useState<VariantRow[]>([])

  useEffect(() => {
    if (!product || isSaving.current) return
    setForm({
      sku: product.sku || '',
      slug: product.slug || '',
      nameEn: product.nameEn || '',
      nameAr: product.nameAr || '',
      descriptionEn: product.descriptionEn || '',
      descriptionAr: product.descriptionAr || '',
      shortDescEn: product.shortDescEn || '',
      shortDescAr: product.shortDescAr || '',
      basePrice: product.basePrice?.toString() || '',
      salePrice: product.salePrice?.toString() || '',
      costPrice: product.costPrice?.toString() || '',
      hasColorOptions: product.hasColorOptions ?? false,
      productType: (product as any).productType || 'ABAYA',
      isFeatured: product.isFeatured ?? false,
      isActive: product.isActive ?? true,
      isNewArrival: product.isNewArrival ?? false,
      collectionIds: product.collections?.map((c) => c.collectionId) || [],
      metaTitleEn: product.metaTitleEn || '',
      metaTitleAr: product.metaTitleAr || '',
      metaDescEn: product.metaDescEn || '',
      metaDescAr: product.metaDescAr || '',
    })
    if (product.images) {
      setImages(product.images.map((img) => ({
        url: img.url,
        altTextEn: img.altTextEn || '',
        altTextAr: img.altTextAr || '',
        isPrimary: img.isPrimary,
      })))
    }
    if (product.variants && product.variants.length > 0) {
      setVariants(product.variants.map((v) => ({
        id: v.id,
        abayaLengthId: v.abayaLengthId || '',
        colorId: v.colorId || '',
        sku: v.sku,
        priceAdjustment: Number(v.priceAdjustment ?? 0),
        stock: Number(v.stock ?? 0),
      })))
      setSelectedLengths([...new Set(product.variants.map((v) => v.abayaLengthId).filter(Boolean) as string[])])
      const colorIds = product.variants
        .map((v) => v.colorId)
        .filter((cid): cid is string => !!cid)
      setSelectedColors([...new Set(colorIds)])
    }
  }, [product])

  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await uploadImage.mutateAsync({ file, folder: 'products' })
    return result.url
  }

  const buildVariants = (existingVariants: VariantRow[]): VariantRow[] => {
    const result: VariantRow[] = []

    const activeLengths = selectedLengths.length > 0
      ? selectedLengths
      : [...new Set(existingVariants.map((v) => v.abayaLengthId))]

    if (activeLengths.length === 0) return existingVariants

    const useColors = form.hasColorOptions && selectedColors.length > 0
    const selectedLengthItems = lengths.filter((l) => activeLengths.includes(l.id))
    const colorOptions: (Color | null)[] = useColors
      ? colors.filter((c) => selectedColors.includes(c.id))
      : [null]

    for (const length of selectedLengthItems) {
      for (const color of colorOptions) {
        const existing = existingVariants.find(
          (v) =>
            v.abayaLengthId === length.id &&
            (color ? v.colorId === color.id : !v.colorId)
        )

        result.push({
          id: existing?.id || `${length.id}-${color?.id || 'nocolor'}`,
          abayaLengthId: length.id,
          colorId: color?.id || '',
          sku: existing?.sku || `${form.sku}-${length.inches}${color ? `-${color.code}` : ''}`,
          priceAdjustment: existing?.priceAdjustment || 0,
          stock: existing?.stock || 0,
        })
      }
    }

    return result
  }

  const generateVariants = () => {
    setVariants(buildVariants(variants))
  }

  const toggleSelection = (id: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(id) ? list.filter((i) => i !== id) : [...list, id])
  }

  const updateVariant = (variantId: string, field: keyof VariantRow, value: string | number) => {
    setVariants(variants.map((v) => {
      if (v.id !== variantId) return v
      return { ...v, [field]: value }
    }))
  }

  const removeVariant = (variantId: string) => {
    setVariants(variants.filter((v) => v.id !== variantId))
  }

  const addImage = () => {
    setImages([...images, { url: '', altTextEn: '', altTextAr: '', isPrimary: images.length === 0 }])
  }

  const updateImage = (index: number, field: 'url' | 'altTextEn' | 'altTextAr' | 'isPrimary', value: string | boolean) => {
    const updated = images.map((img, i) => {
      if (i === index) return { ...img, [field]: value }
      if (field === 'isPrimary' && value === true) return { ...img, isPrimary: false }
      return img
    })
    setImages(updated as typeof images)
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const toggleCollection = (collectionId: string) => {
    setForm({
      ...form,
      collectionIds: form.collectionIds.includes(collectionId)
        ? form.collectionIds.filter((cid) => cid !== collectionId)
        : [...form.collectionIds, collectionId],
    })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    isSaving.current = true

    const currentImages = [...images]
    const simpleVariants = [...variants]
    const builtVariants = buildVariants([...variants])

    try {
      const productData = {
        sku: form.sku,
        slug: form.slug,
        nameEn: form.nameEn,
        nameAr: form.nameAr,
        descriptionEn: form.descriptionEn || undefined,
        descriptionAr: form.descriptionAr || undefined,
        shortDescEn: form.shortDescEn || undefined,
        shortDescAr: form.shortDescAr || undefined,
        basePrice: parseFloat(form.basePrice),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        costPrice: form.costPrice ? parseFloat(form.costPrice) : null,
        hasColorOptions: form.hasColorOptions,
        productType: form.productType,
        metaTitleEn: form.metaTitleEn || undefined,
        metaTitleAr: form.metaTitleAr || undefined,
        metaDescEn: form.metaDescEn || undefined,
        metaDescAr: form.metaDescAr || undefined,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        isNewArrival: form.isNewArrival,
        collectionIds: form.collectionIds,
        images: currentImages
          .filter((img) => img.url.trim() !== '')
          .map((img, index) => ({
            url: img.url,
            altTextEn: img.altTextEn || undefined,
            altTextAr: img.altTextAr || undefined,
            isPrimary: img.isPrimary,
            sortOrder: index,
          })),
        variants: form.productType === 'SIMPLE'
          ? simpleVariants.map((v) => ({
              sku: v.sku || form.sku,
              abayaLengthId: null as string | null,
              colorId: null as string | null,
              priceAdjustment: 0,
              stock: Number(v.stock),
            }))
          : builtVariants.map((v) => ({
              sku: v.sku,
              abayaLengthId: v.abayaLengthId,
              colorId: v.colorId || null,
              priceAdjustment: Number(v.priceAdjustment),
              stock: Number(v.stock),
            })),
      }

      if (isEditing) {
        await updateProduct.mutateAsync({ id: id!, data: productData })
      } else {
        await createProduct.mutateAsync(productData)
      }

      navigate('/products')
    } catch (err: unknown) {
      console.error('Failed to save product:', err)
    } finally {
      setSubmitting(false)
      isSaving.current = false
    }
  }

  if (isEditing && isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'details', label: t('products.productDetails') },
    { key: 'metadata', label: t('products.metadata', 'Metadata') },
    { key: 'variants', label: t('products.variantsCount', { count: variants.length }) },
  ]

  const isPending = submitting || createProduct.isPending || updateProduct.isPending

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditing ? t('products.editProduct') : t('products.addProduct')}
        </h1>
      </div>

      {/* Step Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
        {steps.map((s) => (
          <button
            key={s.key}
            onClick={() => setStep(s.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${step === s.key ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {step === 'details' && (
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('products.basicInfo')}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.nameEn')} *</label>
                  <input type="text" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.nameAr')} *</label>
                  <input type="text" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none" dir="rtl" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.sku')} *</label>
                  <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none font-mono" placeholder="ABY-001" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.slug')} *</label>
                  <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none" placeholder="elegant-abaya-001" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.descriptionEn')}</label>
                  <RichTextEditor
                    value={form.descriptionEn}
                    onChange={(html) => setForm({ ...form, descriptionEn: html })}
                    placeholder="Product description (English)..."
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.descriptionAr')}</label>
                  <RichTextEditor
                    value={form.descriptionAr}
                    onChange={(html) => setForm({ ...form, descriptionAr: html })}
                    placeholder="وصف المنتج (عربي)..."
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.shortDescEn', 'Short Description (EN)')}</label>
                  <RichTextEditor
                    value={form.shortDescEn}
                    onChange={(html) => setForm({ ...form, shortDescEn: html })}
                    placeholder="Short description (English)..."
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.shortDescAr', 'Short Description (AR)')}</label>
                  <RichTextEditor
                    value={form.shortDescAr}
                    onChange={(html) => setForm({ ...form, shortDescAr: html })}
                    placeholder="وصف مختصر (عربي)..."
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('products.pricing')}</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.basePrice')} (AED) *</label>
                <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none" min="0" step="0.01" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.salePrice')} (AED)</label>
                <input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none" min="0" step="0.01" placeholder={t('common.optional')} />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">{t('products.images')}</h2>
              <button onClick={addImage} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
                <Plus className="w-4 h-4" /> {t('products.addImage')}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <ImageUpload
                    value={img.url}
                    onChange={(url) => updateImage(index, 'url', url)}
                    onUpload={handleImageUpload}
                  />
                  <div className="mt-2 space-y-1">
                    <input type="text" value={img.altTextEn} onChange={(e) => updateImage(index, 'altTextEn', e.target.value)} placeholder="Alt text (EN)" className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-slate-900 outline-none" />
                    <input type="text" value={img.altTextAr} onChange={(e) => updateImage(index, 'altTextAr', e.target.value)} placeholder="نص بديل (AR)" className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-slate-900 outline-none" dir="rtl" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={img.isPrimary} onChange={(e) => updateImage(index, 'isPrimary', e.target.checked)} className="w-3 h-3" />
                      {t('products.primary')}
                    </label>
                    <button onClick={() => removeImage(index)} className="text-red-500 hover:text-red-700 ml-auto">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              {images.length === 0 && (
                <div className="col-span-4 text-center py-4 text-slate-500 text-sm">{t('products.noImages')}</div>
              )}
            </div>
          </div>

          {/* Collections */}
          {allCollections.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('products.collections', 'Collections')}</h2>
              <div className="flex flex-wrap gap-2">
                {allCollections.map((collection) => (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => toggleCollection(collection.id)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      form.collectionIds.includes(collection.id)
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {collection.nameEn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Flags */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('products.options')}</h2>
            <div className="flex flex-wrap gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Product Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, productType: 'ABAYA' })
                    }}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      form.productType === 'ABAYA'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    Abaya / Dress
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, productType: 'SIMPLE', hasColorOptions: false })
                      setVariants([{
                        id: 'default-simple',
                        abayaLengthId: '',
                        colorId: '',
                        sku: form.sku,
                        priceAdjustment: 0,
                        stock: 0,
                      }])
                    }}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      form.productType === 'SIMPLE'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    Simple Product
                  </button>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-slate-300" />
                <span className="text-sm font-medium text-slate-700">{t('common.active')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 rounded border-slate-300" />
                <span className="text-sm font-medium text-slate-700">{t('products.featured')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} className="w-4 h-4 rounded border-slate-300" />
                <span className="text-sm font-medium text-slate-700">{t('products.new')}</span>
              </label>
              {form.productType === 'ABAYA' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.hasColorOptions} onChange={(e) => setForm({ ...form, hasColorOptions: e.target.checked })} className="w-4 h-4 rounded border-slate-300" />
                  <span className="text-sm font-medium text-slate-700">{t('products.hasColorOptions')}</span>
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={() => setStep('metadata')} className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors">
              Next: Metadata
            </button>
          </div>
        </div>
      )}

      {step === 'metadata' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('products.seoMeta', 'SEO & Meta')}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.metaTitleEn', 'Meta Title (EN)')}</label>
                  <input type="text" value={form.metaTitleEn} onChange={(e) => setForm({ ...form, metaTitleEn: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.metaTitleAr', 'Meta Title (AR)')}</label>
                  <input type="text" value={form.metaTitleAr} onChange={(e) => setForm({ ...form, metaTitleAr: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none" dir="rtl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.metaDescEn', 'Meta Description (EN)')}</label>
                  <textarea value={form.metaDescEn} onChange={(e) => setForm({ ...form, metaDescEn: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('products.metaDescAr', 'Meta Description (AR)')}</label>
                  <textarea value={form.metaDescAr} onChange={(e) => setForm({ ...form, metaDescAr: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none" dir="rtl" rows={3} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep('details')} className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              {t('products.backToDetails')}
            </button>
            <button onClick={() => setStep('variants')} className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors">
              Next: Variants
            </button>
          </div>
        </div>
      )}

      {step === 'variants' && (
        <div className="space-y-6">
          {form.productType === 'SIMPLE' ? (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Stock & SKU</h2>
              <p className="text-sm text-slate-500 mb-6">This product has a single variant with no size or color options.</p>
              {variants.length === 0 && (
                <button
                  onClick={() => setVariants([{
                    id: 'default-simple',
                    abayaLengthId: '',
                    colorId: '',
                    sku: form.sku,
                    priceAdjustment: 0,
                    stock: 0,
                  }])}
                  className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Create Default Variant
                </button>
              )}
              {variants.length > 0 && (
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                    <input
                      type="text"
                      value={variants[0].sku}
                      onChange={(e) => updateVariant(variants[0].id, 'sku', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                    <input
                      type="number"
                      value={variants[0].stock}
                      onChange={(e) => updateVariant(variants[0].id, 'stock', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                      min="0"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
          <>
          {/* Variant Builder */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('products.buildVariants')}</h2>
            <p className="text-sm text-slate-500 mb-6">{t('products.buildVariantsDesc')}</p>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">{t('products.abayaLength')}</h3>
              <div className="flex flex-wrap gap-2">
                {lengths.map((length) => (
                  <button key={length.id} onClick={() => toggleSelection(length.id, selectedLengths, setSelectedLengths)} className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${selectedLengths.includes(length.id) ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'}`}>
                    {length.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {form.hasColorOptions && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">{t('products.colors')}</h3>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button key={color.id} onClick={() => toggleSelection(color.id, selectedColors, setSelectedColors)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${selectedColors.includes(color.id) ? 'border-slate-900 bg-slate-50 text-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'}`}>
                      {color.hexCode && <span className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: color.hexCode }} />}
                      {color.nameEn}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={generateVariants} disabled={selectedLengths.length === 0} className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {t('products.generateVariants')} ({selectedLengths.length}
              {form.hasColorOptions && selectedColors.length > 0 && ` x ${selectedColors.length}`}
              {' = '}
              {selectedLengths.length * (form.hasColorOptions && selectedColors.length > 0 ? selectedColors.length : 1)} {t('products.combinations')})
            </button>
          </div>

          {/* Generated Variants Table */}
          {variants.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">{t('products.variantsCount', { count: variants.length })}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('products.length')}</th>
                      {form.hasColorOptions && <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('products.color')}</th>}
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">SKU</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('products.priceAdjustment')}</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">{t('products.stock')}</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-slate-600"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {variants.map((variant) => {
                      const vlength = lengths.find((l) => l.id === variant.abayaLengthId)
                      const vcolor = variant.colorId ? colors.find((c) => c.id === variant.colorId) : null
                      return (
                        <tr key={variant.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-700">{vlength?.labelEn}</td>
                          {form.hasColorOptions && (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {vcolor?.hexCode && <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: vcolor.hexCode }} />}
                                <span className="text-slate-700">{vcolor?.nameEn || '-'}</span>
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-3">
                            <input type="text" value={variant.sku} onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)} className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-slate-900 outline-none font-mono" />
                          </td>
                          <td className="px-4 py-3">
                            <input type="number" value={variant.priceAdjustment} onChange={(e) => updateVariant(variant.id, 'priceAdjustment', parseFloat(e.target.value) || 0)} className="w-20 px-2 py-1 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-slate-900 outline-none" min="0" step="0.01" />
                          </td>
                          <td className="px-4 py-3">
                            <input type="number" value={variant.stock} onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)} className="w-20 px-2 py-1 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-slate-900 outline-none" min="0" />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => removeVariant(variant.id)} className="p-1 hover:bg-red-50 rounded transition-colors">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <button onClick={() => setStep('metadata')} className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              Back to Metadata
            </button>
            <button onClick={handleSubmit} disabled={isPending} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isPending ? t('common.loading') : isEditing ? t('common.save') : t('common.create')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
