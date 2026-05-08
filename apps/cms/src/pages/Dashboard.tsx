import { useQuery } from '@tanstack/react-query'
import { useTranslation } from '@repo/i18n'
import { useApiClient } from '@repo/api-client'
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingRevenue: number
  totalProducts: number
  totalCustomers: number
  recentOrders: {
    id: string
    orderNumber: string
    customerName: string
    total: number
    status: string
    createdAt: string
  }[]
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-slate-100 text-slate-700',
}

export function DashboardPage() {
  const { t } = useTranslation()
  const client = useApiClient()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => client.get<DashboardStats>('/admin/stats'),
  })

  const statCards = [
    { key: 'totalOrders', icon: ShoppingCart, value: stats?.totalOrders ?? 0, color: 'bg-blue-500' },
    { key: 'totalRevenue', icon: DollarSign, value: `AED ${(stats?.totalRevenue ?? 0).toLocaleString()}`, color: 'bg-green-500' },
    { key: 'pendingRevenue', icon: DollarSign, value: `AED ${(stats?.pendingRevenue ?? 0).toLocaleString()}`, color: 'bg-yellow-500' },
    { key: 'totalProducts', icon: Package, value: stats?.totalProducts ?? 0, color: 'bg-purple-500' },
    { key: 'totalCustomers', icon: Users, value: stats?.totalCustomers ?? 0, color: 'bg-orange-500' },
  ]

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        {t('dashboard.title')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat) => (
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
          {stats?.recentOrders?.length ? (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">#{order.orderNumber}</p>
                    <p className="text-xs text-slate-500">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">AED {order.total.toLocaleString()}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">{t('common.noData')}</p>
          )}
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
