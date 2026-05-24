import { useState, useCallback } from 'react'
import { useTranslation } from '@repo/i18n'
import { useOrders, useOrder, useUpdateOrderStatus, useDeleteOrder, useBulkDeleteOrders, useResendPurchaseEvent } from '@repo/api-client'
import { Eye, ChevronDown, Trash2, Loader2, Send, CheckCircle, XCircle } from 'lucide-react'
import type { Order, OrderStatus, PaymentStatus } from '@repo/types'

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-slate-100 text-slate-700',
}

const paymentStatusColors: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
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

const paymentStatusOptions: PaymentStatus[] = [
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
]

export function OrdersPage() {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const { data, isLoading } = useOrders({ status: statusFilter || undefined })
  const updateStatus = useUpdateOrderStatus()
  const deleteOrder = useDeleteOrder()
  const bulkDeleteOrders = useBulkDeleteOrders()
  const resendPurchaseEvent = useResendPurchaseEvent()

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'single' | 'bulk'; id?: string } | null>(null)
  const [sentEventIds, setSentEventIds] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const orders = data?.orders || []

  const isAllSelected = orders.length > 0 && orders.every((o: Order) => selectedIds.has(o.id))
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(orders.map((o: Order) => o.id)))
    }
  }, [orders, isAllSelected])

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleStatusChange = async (orderId: string, data: { status?: OrderStatus; paymentStatus?: PaymentStatus }) => {
    await updateStatus.mutateAsync({ id: orderId, data })
  }

  const handleDeleteSingle = async (id: string) => {
    await deleteOrder.mutateAsync(id)
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n })
    setConfirmDelete(null)
  }

  const handleBulkDelete = async () => {
    await bulkDeleteOrders.mutateAsync(Array.from(selectedIds))
    setSelectedIds(new Set())
    setConfirmDelete(null)
  }

  const handleResendPurchaseEvent = async (orderId: string) => {
    try {
      await resendPurchaseEvent.mutateAsync(orderId)
      setSentEventIds((prev) => new Set(prev).add(orderId))
      setToast({ type: 'success', message: `Purchase event sent for order` })
    } catch {
      setToast({ type: 'error', message: `Failed to send purchase event` })
    }
    setTimeout(() => setToast(null), 3000)
  }

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t('orders.title')}</h1>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <button
              onClick={() => setConfirmDelete({ type: 'bulk' })}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedIds.size})
            </button>
          )}
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
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => { if (el) el.indeterminate = isSomeSelected }}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                    />
                  </th>
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
                  <tr key={order.id} className={`hover:bg-slate-50 ${selectedIds.has(order.id) ? 'bg-red-50/50' : ''}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleOne(order.id)}
                        className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      #{order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{order.address?.fullName || order.user?.email || 'Guest'}</td>
                    <td className="px-4 py-3 text-slate-600">AED {order.total}</td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, { status: e.target.value as OrderStatus })}
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
                      <div className="relative inline-block">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => handleStatusChange(order.id, { paymentStatus: e.target.value as PaymentStatus })}
                          className={`appearance-none px-3 py-1 pr-8 rounded-full text-xs font-medium cursor-pointer ${paymentStatusColors[order.paymentStatus]}`}
                        >
                          {paymentStatusOptions.map((ps) => (
                            <option key={ps} value={ps}>
                              {ps}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleResendPurchaseEvent(order.id)}
                          disabled={sentEventIds.has(order.id) || resendPurchaseEvent.isPending}
                          title={sentEventIds.has(order.id) ? 'Event Sent' : 'Send Purchase Event'}
                          className={`p-2 rounded-lg transition-colors ${
                            sentEventIds.has(order.id)
                              ? 'bg-green-50 cursor-default'
                              : resendPurchaseEvent.isPending
                                ? 'bg-slate-100 opacity-50 cursor-wait'
                                : 'hover:bg-blue-50 cursor-pointer'
                          }`}
                        >
                          {sentEventIds.has(order.id) ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : resendPurchaseEvent.isPending ? (
                            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ type: 'single', id: order.id })}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
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

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onStatusChange={handleStatusChange}
          onResendPurchaseEvent={handleResendPurchaseEvent}
          eventSent={sentEventIds.has(selectedOrderId)}
          sending={resendPurchaseEvent.isPending}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Order{confirmDelete.type === 'bulk' ? 's' : ''}?</h3>
            <p className="text-sm text-slate-600 mb-6">
              {confirmDelete.type === 'bulk'
                ? `This will permanently delete ${selectedIds.size} selected orders. This action cannot be undone.`
                : 'This will permanently delete this order. This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete.type === 'single' && confirmDelete.id ? () => handleDeleteSingle(confirmDelete.id!) : handleBulkDelete}
                disabled={deleteOrder.isPending || bulkDeleteOrders.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {(deleteOrder.isPending || bulkDeleteOrders.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium z-50 ${
          toast.type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  )
}

function OrderDetailModal({
  orderId,
  onClose,
  onStatusChange,
  onResendPurchaseEvent,
  eventSent,
  sending,
}: {
  orderId: string
  onClose: () => void
  onStatusChange: (id: string, data: { status?: OrderStatus; paymentStatus?: PaymentStatus }) => Promise<void>
  onResendPurchaseEvent: (id: string) => Promise<void>
  eventSent: boolean
  sending: boolean
}) {
  const { t } = useTranslation()
  const { data: order } = useOrder(orderId)

  if (!order) return null

  const addr = order.address

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Order #{order.orderNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">{t('orders.date')}</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">{t('orders.paymentMethod')}</p>
              <p className="font-medium">{order.paymentMethod}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">{t('orders.status')}</p>
              <div className="relative inline-block">
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order.id, { status: e.target.value as OrderStatus })}
                  className={`appearance-none px-3 py-1 pr-8 rounded-full text-xs font-medium cursor-pointer ${statusColors[order.status]}`}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">{t('orders.paymentStatus')}</p>
              <div className="relative inline-block">
                <select
                  value={order.paymentStatus}
                  onChange={(e) => onStatusChange(order.id, { paymentStatus: e.target.value as PaymentStatus })}
                  className={`appearance-none px-3 py-1 pr-8 rounded-full text-xs font-medium cursor-pointer ${paymentStatusColors[order.paymentStatus]}`}
                >
                  {paymentStatusOptions.map((ps) => (
                    <option key={ps} value={ps}>{ps}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {addr && (
            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-500 mb-2">{t('orders.shippingAddress')}</p>
              <div className="text-sm text-slate-900 space-y-1">
                <p className="font-medium">{addr.fullName}</p>
                <p dir="ltr">{addr.phone}</p>
                <p>{addr.street}{addr.building ? `, ${addr.building}` : ''}{addr.apartment ? `, Apt ${addr.apartment}` : ''}</p>
                {addr.district && <p>{addr.district}</p>}
                <p>{addr.city}, {addr.country}</p>
                {addr.postalCode && <p>{addr.postalCode}</p>}
              </div>
            </div>
          )}

          {order.items && order.items.length > 0 && (
            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-500 mb-2">{t('orders.items')}</p>
              <div className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.productNameEn}</p>
                      <p className="text-xs text-slate-500">{item.variantDetails} × {item.quantity}</p>
                    </div>
                    <p className="text-sm text-slate-900">AED {item.totalPrice}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 pt-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('orders.subtotal')}</span>
                <span>AED {order.subtotal}</span>
              </div>
              {(order.discount > 0 || order.couponCode) && (
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    {t('orders.discount')}
                    {order.couponCode && <span className="text-xs text-slate-400 ml-1">({order.couponCode})</span>}
                  </span>
                  <span>-AED {order.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">{t('orders.shipping')}</span>
                <span>AED {order.shippingCost}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 pt-2">
                <span>{t('orders.total')}</span>
                <span>AED {order.total}</span>
              </div>
            </div>
          </div>

          {order.notesCustomer && (
            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-500 mb-1">{t('orders.customerNotes')}</p>
              <p className="text-sm text-slate-900">{order.notesCustomer}</p>
            </div>
          )}

          <div className="border-t border-slate-200 pt-4">
            <button
              onClick={() => onResendPurchaseEvent(order.id)}
              disabled={eventSent || sending}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                eventSent
                  ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                  : sending
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-wait'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {eventSent ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Event Sent
                </>
              ) : sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Purchase Event
                </>
              )}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  )
}
