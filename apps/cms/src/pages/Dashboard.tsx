import { useTranslation } from '@repo/i18n'
import { Package, ShoppingCart, Users } from 'lucide-react'

const stats = [
  { key: 'totalOrders', icon: ShoppingCart, value: '0', color: 'bg-blue-500' },
  { key: 'totalRevenue', icon: Users, value: 'AED 0', color: 'bg-green-500' },
  { key: 'totalProducts', icon: Package, value: '0', color: 'bg-purple-500' },
  { key: 'totalCustomers', icon: Users, value: '0', color: 'bg-orange-500' },
]

export function DashboardPage() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        {t('dashboard.title')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">
                  {t(`dashboard.${stat.key}`)}
                </p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {t('dashboard.recentOrders')}
          </h2>
          <p className="text-slate-500 text-sm">{t('common.noData')}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {t('dashboard.topProducts')}
          </h2>
          <p className="text-slate-500 text-sm">{t('common.noData')}</p>
        </div>
      </div>
    </div>
  )
}
