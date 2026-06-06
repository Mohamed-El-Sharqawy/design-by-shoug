import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '@repo/api-client'
import { Globe, User, Wrench } from 'lucide-react'
import { useState } from 'react'

interface MaintenanceData {
  enabled: boolean
  message: string | null
}

export function Header() {
  const { language, setLanguage } = useLanguageStore()
  const user = useAuthStore((s) => s.user)
  const client = useApiClient()
  const queryClient = useQueryClient()
  const [showMessageInput, setShowMessageInput] = useState(false)
  const [message, setMessage] = useState('')

  const { data: maintenance } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => client.get<MaintenanceData>('/settings/maintenance'),
  })

  const toggleMutation = useMutation({
    mutationFn: (data: { enabled: boolean; message?: string }) =>
      client.patch<MaintenanceData>('/settings/maintenance', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
    },
  })

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en')
  }

  const isOn = maintenance?.enabled ?? false

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div />

      <div className="flex items-center gap-4">
        {/* Maintenance Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMessageInput(!showMessageInput)}
            className={`p-2 rounded-lg transition-colors ${
              isOn ? 'bg-amber-100 text-amber-700' : 'hover:bg-slate-100 text-slate-500'
            }`}
            title="Maintenance Mode"
          >
            <Wrench className="w-4 h-4" />
          </button>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isOn}
              onChange={(e) => {
                toggleMutation.mutate({ enabled: e.target.checked, message })
              }}
              className="sr-only peer"
              disabled={toggleMutation.isPending}
            />
            <div
              className={`w-9 h-5 rounded-full transition-colors ${
                isOn ? 'bg-amber-500' : 'bg-slate-300'
              } ${toggleMutation.isPending ? 'opacity-50' : ''}`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  isOn ? 'translate-x-4' : ''
                }`}
              />
            </div>
          </label>

          {isOn && (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded">
              Maintenance
            </span>
          )}
        </div>

        {showMessageInput && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Custom message..."
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-400 outline-none w-48"
            />
            <button
              onClick={() => {
                toggleMutation.mutate({ enabled: isOn, message })
                setShowMessageInput(false)
              }}
              className="px-2 py-1.5 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Save
            </button>
          </div>
        )}

        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Globe className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">
            {language === 'en' ? 'العربية' : 'English'}
          </span>
        </button>

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100">
          <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-700">
              {user?.firstName || 'Admin'}
            </p>
            <p className="text-slate-500 text-xs">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
