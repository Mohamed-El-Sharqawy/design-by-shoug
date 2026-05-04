import { useState, useRef } from 'react'
import { useTranslation } from '@repo/i18n'
import { X, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onUpload?: (file: File) => Promise<string>
  placeholder?: string
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  placeholder,
  className = '',
}: ImageUploadProps) {
  const { t } = useTranslation()
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError(t('common.selectImage'))
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setError(t('common.imageSizeLimit'))
      return
    }

    setError(null)

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    if (onUpload) {
      setIsUploading(true)
      try {
        const url = await onUpload(file)
        onChange(url)
        setPreview(url)
      } catch {
        setError(t('common.uploadFailed'))
        setPreview(value || null)
      } finally {
        setIsUploading(false)
      }
    } else {
      onChange(localPreview)
    }

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleUrlChange = (url: string) => {
    onChange(url)
    setPreview(url)
  }

  const handleRemove = () => {
    onChange('')
    setPreview(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-slate-200"
            onError={() => {
              setPreview(null)
              setError(t('common.loadFailed'))
            }}
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
          <div className="flex flex-col items-center justify-center py-6">
            {isUploading ? (
              <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ImageIcon className="w-10 h-10 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">
                  {placeholder || t('common.clickToUpload')}
                </p>
                <p className="text-xs text-slate-400 mt-1">{t('common.imageFormats')}</p>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

      <div className="mt-3">
        <label className="block text-xs text-slate-500 mb-1">
          {t('common.orEnterUrl')}
        </label>
        <input
          type="url"
          value={value || ''}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
        />
      </div>
    </div>
  )
}
