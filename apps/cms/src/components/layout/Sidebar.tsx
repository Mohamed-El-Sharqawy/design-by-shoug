import { NavLink } from 'react-router-dom'
import { useTranslation } from '@repo/i18n'
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Image,
  Instagram,
  Video,
  Star,
  Ticket,
  Truck,
  Palette,
  Settings,
  LogOut,
  Ruler,
  Scan,
  MessageSquare,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'nav.dashboard' },
  { path: '/products', icon: Package, label: 'nav.products' },
  { path: '/collections', icon: FolderOpen, label: 'nav.collections' },
  { path: '/orders', icon: ShoppingCart, label: 'nav.orders' },
  { path: '/banners', icon: Image, label: 'nav.banners' },
  { path: '/instagram', icon: Instagram, label: 'nav.instagram' },
  { path: '/videos', icon: Video, label: 'nav.videos' },
  { path: '/featured', icon: Star, label: 'nav.featured' },
  { path: '/coupons', icon: Ticket, label: 'nav.coupons' },
  { path: '/shipping', icon: Truck, label: 'nav.shipping' },
  { path: '/colors', icon: Palette, label: 'nav.colors' },
  { path: '/abaya-lengths', icon: Ruler, label: 'nav.abayaLengths' },
  { path: '/body-sizes', icon: Scan, label: 'nav.bodySizes' },
  { path: '/customer-reviews', icon: MessageSquare, label: 'nav.customerReviews' },
]

export function Sidebar() {
  const { t } = useTranslation()
  const logout = useAuthStore((s) => s.logout)

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">{t('app.name')}</h1>
        <p className="text-sm text-slate-400">{t('app.tagline')}</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{t(item.label)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span>{t('nav.settings')}</span>
        </NavLink>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  )
}
