import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '@repo/api-client'
import {
  ShoppingCart,
  Globe,
  DollarSign,
  TrendingUp,
  Crown,
  Download,
  Package,
  UserPlus,
  Truck,
  ChevronRight,
  Calendar,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

type PeriodKey = 'this_month' | 'last_7' | 'last_30' | 'last_3_months' | 'last_6_months' | 'last_12_months' | 'range'

interface AnalyticsData {
  period: { start: string; end: string }
  orders: { total: number; averagePerDay: number }
  internationalOrders: { total: number; topCountry: string | null }
  revenue: { total: number }
  pendingCOD: { orders: number; revenue: number }
  customers: { newCount: number; returningCount: number }
  topProduct: { name: string; sales: number } | null
  revenueTrend: { date: string; revenue: number }[]
  ordersOverTime: { date: string; orders: number }[]
  topProducts: { name: string; sales: number; revenue: number }[]
  paymentMethods: {
    method: string
    count: number
    revenue: number
    revenuePercentage: number
    countPercentage: number
  }[]
  newCustomersOverTime: { date: string; customers: number }[]
  topLocations: {
    country: string
    orders: number
    cities: { city: string; orders: number }[]
  }[]
  productTypes: { type: string; sales: number }[]
  delivery: { totalDelivered: number; totalOrders: number }
}

const PERIODS: Record<PeriodKey, string> = {
  this_month: 'This month',
  last_7: 'Last 7 days',
  last_30: 'Last 30 days',
  last_3_months: 'Last 3 months',
  last_6_months: 'Last 6 months',
  last_12_months: 'Last 12 months',
  range: 'Custom Range',
}

function getPeriodDates(
  key: PeriodKey,
  rangeFrom?: string,
  rangeTo?: string
): { startDate: string; endDate: string } {
  const now = new Date()
  const endDate = now.toISOString().split('T')[0]
  let startDate: string

  switch (key) {
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      break
    case 'last_7': {
      const d = new Date(now)
      d.setDate(d.getDate() - 7)
      startDate = d.toISOString().split('T')[0]
      break
    }
    case 'last_30': {
      const d = new Date(now)
      d.setDate(d.getDate() - 30)
      startDate = d.toISOString().split('T')[0]
      break
    }
    case 'last_3_months': {
      const d = new Date(now)
      d.setMonth(d.getMonth() - 3)
      startDate = d.toISOString().split('T')[0]
      break
    }
    case 'last_6_months': {
      const d = new Date(now)
      d.setMonth(d.getMonth() - 6)
      startDate = d.toISOString().split('T')[0]
      break
    }
    case 'last_12_months': {
      const d = new Date(now)
      d.setFullYear(d.getFullYear() - 1)
      startDate = d.toISOString().split('T')[0]
      break
    }
    case 'range':
      startDate = rangeFrom || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      return { startDate, endDate: rangeTo || endDate }
  }

  return { startDate, endDate }
}

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

export function DashboardPage() {
  const client = useApiClient()
  const [period, setPeriod] = useState<PeriodKey>('this_month')
  const [paymentView, setPaymentView] = useState<'revenue' | 'volume'>('revenue')
  const [rangeFrom, setRangeFrom] = useState('')
  const [rangeTo, setRangeTo] = useState('')

  const { startDate, endDate } = useMemo(
    () => getPeriodDates(period, rangeFrom, rangeTo),
    [period, rangeFrom, rangeTo]
  )

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', startDate, endDate],
    queryFn: () =>
      client.get<AnalyticsData>(
        `/admin/analytics?startDate=${startDate}&endDate=${endDate}`
      ),
  })

  const analytics = data

  const paymentChartData = useMemo(() => {
    if (!analytics?.paymentMethods) return []
    return analytics.paymentMethods.map((pm) => ({
      name: pm.method,
      value: paymentView === 'revenue' ? pm.revenue : pm.count,
      percentage:
        paymentView === 'revenue' ? pm.revenuePercentage : pm.countPercentage,
    }))
  }, [analytics?.paymentMethods, paymentView])

  if (isLoading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodKey)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
          >
            {Object.entries(PERIODS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {period === 'range' && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={rangeFrom}
                onChange={(e) => setRangeFrom(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                placeholder="From"
              />
              <span className="text-sm text-slate-400">to</span>
              <input
                type="date"
                value={rangeTo}
                onChange={(e) => setRangeTo(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                placeholder="To"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          icon={ShoppingCart}
          iconBg="bg-blue-500"
          label="Orders"
          value={String(analytics?.orders.total ?? 0)}
          subtitle={`Average: ${analytics?.orders.averagePerDay ?? 0} per day`}
        />
        <StatCard
          icon={Globe}
          iconBg="bg-indigo-500"
          label="International Orders"
          value={String(analytics?.internationalOrders.total ?? 0)}
          subtitle={
            analytics?.internationalOrders.topCountry
              ? `Top: ${analytics.internationalOrders.topCountry}`
              : 'No international orders'
          }
        />
        <StatCard
          icon={DollarSign}
          iconBg="bg-green-500"
          label="Total Revenue"
          value={`AED ${(analytics?.revenue.total ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Paid revenue for the period"
        />
        <StatCard
          icon={DollarSign}
          iconBg="bg-yellow-500"
          label="Pending COD Revenue"
          value={`AED ${(analytics?.pendingCOD.revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle={`${analytics?.pendingCOD.orders ?? 0} pending COD orders`}
        />
        <StatCard
          icon={UserPlus}
          iconBg="bg-orange-500"
          label="New Customers"
          value={String(analytics?.customers.newCount ?? 0)}
          subtitle={`Returning: ${analytics?.customers.returningCount ?? 0}`}
        />
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-500 p-2.5 rounded-lg">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-slate-500">Top Product</span>
          </div>
          {analytics?.topProduct ? (
            <>
              <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                {analytics.topProduct.name}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {analytics.topProduct.sales} sales
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">No sales data</p>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue Trend" subtitle="Revenue over the selected period">
          {analytics?.revenueTrend && analytics.revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics.revenueTrend}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  tickFormatter={(v: string) => {
                    const parts = v.split('-')
                    return `${parts[1]}/${parts[2]}`
                  }}
                />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  formatter={(value) => [`AED ${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        <ChartCard title="Orders Over Time" subtitle="Order trend for the selected period">
          {analytics?.ordersOverTime && analytics.ordersOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.ordersOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  tickFormatter={(v: string) => {
                    const parts = v.split('-')
                    return `${parts[1]}/${parts[2]}`
                  }}
                />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>
      </div>

      {/* Top Selling Categories (Product Types only) */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Top Selling Categories</h2>
            <p className="text-sm text-slate-500">Performance breakdown by product type</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>

        {analytics?.productTypes && analytics.productTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analytics.productTypes.map((pt) => (
              <div key={pt.type} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-800">
                    {pt.type === 'ABAYA' ? 'Abaya' : pt.type === 'SIMPLE' ? 'Simple' : pt.type}
                  </span>
                  <span className="text-xs text-slate-500">{pt.sales} sales</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (pt.sales /
                          Math.max(...analytics.productTypes.map((t) => t.sales))) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <NoData />
        )}
      </div>

      {/* Top Selling Products */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Top Selling Products</h2>
            <p className="text-sm text-slate-500">Best performing products by sales and revenue</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>

        {analytics?.topProducts && analytics.topProducts.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Product</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Sales</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.topProducts.map((product) => (
                    <tr key={product.name} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900 max-w-md truncate">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{product.sales}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        AED {product.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 mt-4">
              View detailed product analytics
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <NoData />
        )}
      </div>

      {/* Payment Methods & New Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Payment Methods</h2>
              <p className="text-sm text-slate-500">COD vs Online (via Ziina)</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                paymentView === 'revenue'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => setPaymentView('revenue')}
            >
              By Revenue
            </button>
            <button
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                paymentView === 'volume'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => setPaymentView('volume')}
            >
              By Order Volume
            </button>
          </div>

          {analytics?.paymentMethods && analytics.paymentMethods.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {paymentChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      formatter={(value) =>
                        paymentView === 'revenue'
                          ? [`AED ${Number(value).toLocaleString()}`]
                          : [`${value} orders`]
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-4">
                {paymentChartData.map((pm, index) => (
                  <div key={pm.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <span className="text-sm font-semibold text-slate-900">
                          {pm.percentage}%
                        </span>
                        <span className="text-sm font-medium text-slate-700">
                          {pm.name === 'COD' ? 'COD' : 'ONLINE (Ziina)'}
                        </span>
                      </div>
                      <span className="text-sm text-slate-600">
                        {paymentView === 'revenue'
                          ? `AED ${pm.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                          : `${pm.value} orders`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${pm.percentage}%`,
                          backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <NoData />
          )}
        </div>

        {/* New Customers Over Time */}
        <ChartCard title="New Customers Over Time" subtitle="Customer acquisition trend">
          {analytics?.newCustomersOverTime && analytics.newCustomersOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.newCustomersOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  tickFormatter={(v: string) => {
                    const parts = v.split('-')
                    return `${parts[1]}/${parts[2]}`
                  }}
                />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="customers" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top Locations */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Top Locations</h2>
            <button className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Download className="w-3 h-3" />
              Export
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-4">Order distribution by country &amp; city</p>
          {analytics?.topLocations && analytics.topLocations.length > 0 ? (
            <div className="space-y-4">
              {analytics.topLocations.map((loc) => (
                <div key={loc.country}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-900">{loc.country}</span>
                    <span className="text-xs font-medium text-slate-500">{loc.orders} orders</span>
                  </div>
                  {loc.cities.length > 0 && (
                    <div className="ml-3 space-y-1.5">
                      {loc.cities.slice(0, 5).map((c) => (
                        <div key={c.city} className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">{c.city}</span>
                          <span className="text-xs text-slate-400">{c.orders}</span>
                        </div>
                      ))}
                      {loc.cities.length > 5 && (
                        <span className="text-xs text-indigo-600">+{loc.cities.length - 5} more cities</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <NoData />
          )}
        </div>

        {/* Delivery Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Delivery Performance</h2>
            <p className="text-xs text-slate-500">Order delivery status</p>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-slate-600">Delivered</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {analytics?.delivery.totalDelivered ?? 0}
              </p>
              <p className="text-xs text-slate-400">
                {analytics?.delivery.totalOrders
                  ? `${Math.round((analytics.delivery.totalDelivered / analytics.delivery.totalOrders) * 100)}% of total orders`
                  : 'No orders'}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-slate-600">Total Orders</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {analytics?.delivery.totalOrders ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Quick Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500">Total Revenue</span>
              <span className="text-sm font-semibold text-slate-900">
                AED {(analytics?.revenue.total ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-xs text-yellow-600">Pending COD Revenue</span>
              <span className="text-sm font-semibold text-yellow-700">
                AED {(analytics?.pendingCOD.revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500">Avg. Order Value</span>
              <span className="text-sm font-semibold text-slate-900">
                AED {(
                  analytics?.orders.total
                    ? (analytics.revenue.total / analytics.orders.total)
                    : 0
                ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500">New Customers</span>
              <span className="text-sm font-semibold text-slate-900">
                {analytics?.customers.newCount ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500">Returning Customers</span>
              <span className="text-sm font-semibold text-slate-900">
                {analytics?.customers.returningCount ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-wrap gap-3">
          <a
            href="/orders"
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            View All Orders
          </a>
          <a
            href="/products"
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Package className="w-4 h-4" />
            View All Products
          </a>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
            <TrendingUp className="w-4 h-4" />
            View Marketing Analytics
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  iconBg,
  label,
  value,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  label: string
  value: string
  subtitle: string
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-3">
        <div className={`${iconBg} p-2.5 rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>
      {children}
    </div>
  )
}

function NoData() {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-slate-400">No data available for this period</p>
    </div>
  )
}
