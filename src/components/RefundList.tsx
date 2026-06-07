import React from 'react'
import { DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { RefundStatus } from '@/types'
import { formatPrice, formatDate, getStatusText, getStatusColor } from '@/utils/helpers'

export const RefundList: React.FC = () => {
  const { state, dispatch } = useApp()

  const propertyRefunds = state.selectedPropertyId
    ? state.refunds.filter((r) => {
        const booking = state.bookings.find((b) => b.id === r.bookingId)
        return booking?.propertyId === state.selectedPropertyId
      })
    : state.refunds

  const handleUpdateRefundStatus = (id: string, status: RefundStatus) => {
    const refund = state.refunds.find((r) => r.id === id)
    if (refund) {
      const updatedRefunds = state.refunds.map((r) =>
        r.id === id ? { ...r, status } : r
      )
      dispatch({
        type: 'UPDATE_BOOKING',
        payload: {
          id: refund.bookingId,
          propertyId: '',
          guestId: '',
          guestName: '',
          checkIn: '',
          checkOut: '',
          guestCount: 0,
          totalPrice: 0,
          status: 'cancelled',
          createdAt: '',
        },
      })
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">退款管理</h3>
        <p className="text-sm text-gray-500 mt-1">
          共 {propertyRefunds.length} 条退款记录
        </p>
      </div>

      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        {propertyRefunds.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>暂无退款记录</p>
          </div>
        ) : (
          propertyRefunds.map((refund) => {
            const booking = state.bookings.find(
              (b) => b.id === refund.bookingId
            )
            return (
              <div
                key={refund.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-gray-800">
                        {booking?.guestName || '未知客人'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          refund.status
                        )}`}
                      >
                        {getStatusText(refund.status)}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="font-medium text-bnb-primary">
                        退款金额：{formatPrice(refund.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        申请时间：{formatDate(refund.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        原因：{refund.reason}
                      </div>
                    </div>
                  </div>

                  {state.currentRole === 'host' &&
                    refund.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() =>
                            handleUpdateRefundStatus(refund.id, 'processing')
                          }
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="处理中"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateRefundStatus(refund.id, 'completed')
                          }
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="已完成"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateRefundStatus(refund.id, 'rejected')
                          }
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="拒绝"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
