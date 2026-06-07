import React, { useState } from 'react'
import { Calendar, Users, DollarSign, XCircle, CheckCircle, Clock } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Booking } from '@/types'
import { formatPrice, formatDate, getStatusText, getStatusColor, calculateNights } from '@/utils/helpers'

interface BookingListProps {
  onSelectBooking?: (booking: Booking) => void
}

export const BookingList: React.FC<BookingListProps> = ({ onSelectBooking }) => {
  const { state, dispatch } = useApp()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  const propertyBookings = state.selectedPropertyId
    ? state.bookings.filter((b) => b.propertyId === state.selectedPropertyId)
    : state.bookings

  const handleCancelBooking = () => {
    if (!selectedBooking) return

    dispatch({
      type: 'CANCEL_BOOKING',
      payload: {
        bookingId: selectedBooking.id,
        reason: cancelReason || '客人取消',
      },
    })

    setShowCancelModal(false)
    setSelectedBooking(null)
    setCancelReason('')
  }

  const handleConfirmBooking = (booking: Booking) => {
    dispatch({
      type: 'UPDATE_BOOKING',
      payload: { ...booking, status: 'confirmed' },
    })
  }

  const openCancelModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowCancelModal(true)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">预订管理</h3>
        <p className="text-sm text-gray-500 mt-1">
          共 {propertyBookings.length} 条预订记录
        </p>
      </div>

      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {propertyBookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>暂无预订记录</p>
          </div>
        ) : (
          propertyBookings.map((booking) => (
            <div
              key={booking.id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onSelectBooking?.(booking)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-800">
                      {booking.guestName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {getStatusText(booking.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {formatDate(booking.checkIn)} -{' '}
                        {formatDate(booking.checkOut)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>
                        {booking.guestCount}人 ·{' '}
                        {calculateNights(booking.checkIn, booking.checkOut)}晚
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-bnb-primary">
                        {formatPrice(booking.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {state.currentRole === 'host' && booking.status !== 'cancelled' && (
                  <div className="flex gap-2 ml-4">
                    {booking.status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleConfirmBooking(booking)
                        }}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        title="确认预订"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openCancelModal(booking)
                      }}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="取消预订"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              取消预订
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              确定要取消 {selectedBooking.guestName} 的预订吗？取消后：
            </p>
            <ul className="text-sm text-gray-600 mb-4 space-y-2">
              <li className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-500" />
                日历将立即空出
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                相关保洁安排将被取消
              </li>
              <li className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-500" />
                将生成退款申请（退款80%）
              </li>
            </ul>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                取消原因
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bnb-primary focus:border-transparent"
                rows={3}
                placeholder="请输入取消原因..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setSelectedBooking(null)
                  setCancelReason('')
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                返回
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-4 py-2 bg-bnb-primary text-white rounded-lg hover:bg-bnb-primary-dark transition-colors"
              >
                确认取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
