import { useLanguageStore } from '@/stores/language'
import { useAuthStore } from '@/stores/auth'
import { Globe, User } from 'lucide-react'

export function Header() {
  const { language, setLanguage } = useLanguageStore()
  const user = useAuthStore((s) => s.user)

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en')
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div />

      <div className="flex items-center gap-4">
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
