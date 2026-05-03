import { useState } from 'react'
import { useTranslation } from '@repo/i18n'
import { useOrders, useUpdateOrderStatus } from '@repo/api-client'
import { Eye, ChevronDown } from 'lucide-react'
import type { Order, OrderStatus } from '@repo/types'

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-slate-100 text-slate-700',
}

const statusOptions: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]

export function OrdersPage() {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const { data, isLoading } = useOrders({ status: statusFilter || undefined })
  const updateStatus = useUpdateOrderStatus()

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    await updateStatus.mutateAsync({ id: orderId, data: { status } })
  }

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  const orders = data?.items || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('orders.title')}</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
        >
          <option value="">{t('orders.allStatuses')}</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {t(`orders.${status.toLowerCase()}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    {t('orders.orderNumber')}
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    {t('orders.customer')}
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    {t('orders.total')}
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    {t('orders.status')}
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    {t('orders.paymentStatus')}
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                    {t('orders.date')}
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order: Order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      #{order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{order.email}</td>
                    <td className="px-4 py-3 text-slate-600">AED {order.total}</td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`appearance-none px-3 py-1 pr-8 rounded-full text-xs font-medium cursor-pointer ${statusColors[order.status]}`}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {t(`orders.${status.toLowerCase()}`)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : order.paymentStatus === 'FAILED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">{t('common.noData')}</div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Order #{selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">{t('orders.customer')}</p>
                  <p className="font-medium">{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t('orders.date')}</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500 mb-2">{t('orders.orderSummary')}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t('orders.subtotal')}</span>
                    <span>AED {selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('orders.discount')}</span>
                    <span>-AED {selectedOrder.discount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('orders.shipping')}</span>
                    <span>AED {selectedOrder.shippingCost}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>{t('orders.total')}</span>
                    <span>AED {selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.notesCustomer && (
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-sm text-slate-500 mb-1">{t('orders.customerNotes')}</p>
                  <p>{selectedOrder.notesCustomer}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-6 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
