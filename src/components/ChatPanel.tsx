import React, { useState, useRef, useEffect } from 'react'
import { Send, Calendar, Users, DollarSign, X, CheckCircle, MessageSquare } from 'lucide-react'
import { formatISO, startOfDay, addDays, eachDayOfInterval } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { ChatMessage, Booking } from '@/types'
import {
  formatPrice,
  formatDate,
  formatTime,
  calculateNights,
  generateId,
} from '@/utils/helpers'

interface ChatPanelProps {
  onShowCalendar?: () => void
  selectedStartDate?: Date | null
  selectedEndDate?: Date | null
  onDateSelect?: (start: Date | null, end: Date | null) => void
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  onShowCalendar,
  selectedStartDate,
  selectedEndDate,
  onDateSelect,
}) => {
  const { state, dispatch, getDatePrice, isDateAvailable } = useApp()
  const [message, setMessage] = useState('')
  const [guestCount, setGuestCount] = useState(2)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const conversation = state.conversations.find(
    (c) => c.id === state.selectedConversationId
  )
  const messages = state.selectedConversationId
    ? state.messages[state.selectedConversationId] || []
    : []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const calculateTotalPrice = (): number => {
    if (!selectedStartDate || !selectedEndDate || !state.selectedPropertyId) return 0

    const dates = eachDayOfInterval({
      start: selectedStartDate,
      end: addDays(selectedEndDate, -1),
    })

    return dates.reduce((total, date) => {
      const dp = getDatePrice(state.selectedPropertyId!, date)
      return total + (dp?.price || 0)
    }, 0)
  }

  const handleSendMessage = () => {
    if (!message.trim() || !state.selectedConversationId) return

    const newMessage: ChatMessage = {
      id: generateId(),
      conversationId: state.selectedConversationId,
      senderId: state.currentUserId,
      senderRole: state.currentRole,
      content: message.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
    }

    dispatch({
      type: 'SEND_MESSAGE',
      payload: {
        conversationId: state.selectedConversationId,
        message: newMessage,
      },
    })

    setMessage('')
  }

  const handleSendBookingRequest = () => {
    if (
      !state.selectedConversationId ||
      !selectedStartDate ||
      !selectedEndDate ||
      !state.selectedPropertyId
    )
      return

    const totalPrice = calculateTotalPrice()
    const nights = calculateNights(
      formatISO(selectedStartDate, { representation: 'date' }),
      formatISO(selectedEndDate, { representation: 'date' })
    )

    const bookingMessage: ChatMessage = {
      id: generateId(),
      conversationId: state.selectedConversationId,
      senderId: state.currentUserId,
      senderRole: state.currentRole,
      content: `确认预订：${formatDate(
        formatISO(selectedStartDate, { representation: 'date' })
      )} - ${formatDate(
        formatISO(selectedEndDate, { representation: 'date' })
      )}，${guestCount}人，${nights}晚`,
      timestamp: new Date().toISOString(),
      type: 'booking_request',
      bookingData: {
        checkIn: formatISO(selectedStartDate, { representation: 'date' }),
        checkOut: formatISO(selectedEndDate, { representation: 'date' }),
        guestCount,
        totalPrice,
      },
    }

    dispatch({
      type: 'SEND_MESSAGE',
      payload: {
        conversationId: state.selectedConversationId,
        message: bookingMessage,
      },
    })

    setShowBookingForm(false)
    onDateSelect?.(null, null)
  }

  const handleConfirmBooking = (msg: ChatMessage) => {
    if (!msg.bookingData || !state.selectedConversationId || !state.selectedPropertyId)
      return

    const conv = state.conversations.find((c) => c.id === state.selectedConversationId)
    if (!conv) return

    const booking: Booking = {
      id: generateId(),
      propertyId: state.selectedPropertyId,
      guestId: conv.guestId,
      guestName: conv.guestName,
      checkIn: msg.bookingData.checkIn,
      checkOut: msg.bookingData.checkOut,
      guestCount: msg.bookingData.guestCount,
      totalPrice: msg.bookingData.totalPrice,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    }

    dispatch({ type: 'CREATE_BOOKING', payload: booking })

    const confirmMessage: ChatMessage = {
      id: generateId(),
      conversationId: state.selectedConversationId,
      senderId: state.currentUserId,
      senderRole: state.currentRole,
      content: '预订已确认！',
      timestamp: new Date().toISOString(),
      type: 'booking_confirm',
      bookingId: booking.id,
      bookingData: msg.bookingData,
    }

    dispatch({
      type: 'SEND_MESSAGE',
      payload: {
        conversationId: state.selectedConversationId,
        message: confirmMessage,
      },
    })
  }

  const handleCancelBookingFromChat = (bookingId: string) => {
    if (!state.selectedConversationId) return

    dispatch({
      type: 'CANCEL_BOOKING',
      payload: { bookingId, reason: '聊天中取消' },
    })

    const cancelMessage: ChatMessage = {
      id: generateId(),
      conversationId: state.selectedConversationId,
      senderId: state.currentUserId,
      senderRole: state.currentRole,
      content: '已取消预订，日历已空出，正在处理退款。',
      timestamp: new Date().toISOString(),
      type: 'booking_cancel',
      bookingId,
    }

    dispatch({
      type: 'SEND_MESSAGE',
      payload: {
        conversationId: state.selectedConversationId,
        message: cancelMessage,
      },
    })
  }

  const renderMessage = (msg: ChatMessage) => {
    const isOwn = msg.senderRole === state.currentRole

    return (
      <div
        key={msg.id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[80%] ${
            isOwn ? 'order-1' : 'order-2'
          }`}
        >
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-bnb-primary text-white rounded-br-none'
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}
          >
            {msg.type === 'text' && <p>{msg.content}</p>}

            {msg.type === 'booking_request' && msg.bookingData && (
              <div className="space-y-2">
                <p className="font-medium mb-2">{msg.content}</p>
                <div className="bg-white/20 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(msg.bookingData.checkIn)} -{' '}
                      {formatDate(msg.bookingData.checkOut)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      {msg.bookingData.guestCount}人 ·{' '}
                      {calculateNights(
                        msg.bookingData.checkIn,
                        msg.bookingData.checkOut
                      )}
                      晚
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatPrice(msg.bookingData.totalPrice)}</span>
                  </div>
                </div>
                {state.currentRole === 'host' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleConfirmBooking(msg)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/30 hover:bg-white/40 rounded-lg transition-colors text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      确认预订
                    </button>
                  </div>
                )}
              </div>
            )}

            {msg.type === 'booking_confirm' && msg.bookingData && (
              <div className="space-y-2">
                <p className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {msg.content}
                </p>
                <div className="bg-white/20 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(msg.bookingData.checkIn)} -{' '}
                      {formatDate(msg.bookingData.checkOut)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      {msg.bookingData.guestCount}人 ·{' '}
                      {calculateNights(
                        msg.bookingData.checkIn,
                        msg.bookingData.checkOut
                      )}
                      晚
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatPrice(msg.bookingData.totalPrice)}</span>
                  </div>
                </div>
                {msg.bookingId && (
                  <button
                    onClick={() => handleCancelBookingFromChat(msg.bookingId!)}
                    className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
                  >
                    <X className="w-4 h-4" />
                    取消预订
                  </button>
                )}
              </div>
            )}

            {msg.type === 'booking_cancel' && (
              <div className="flex items-center gap-2">
                <X className="w-5 h-5" />
                <p>{msg.content}</p>
              </div>
            )}
          </div>
          <div
            className={`text-xs text-gray-400 mt-1 ${
              isOwn ? 'text-right' : 'text-left'
            }`}
          >
            {formatTime(msg.timestamp)}
          </div>
        </div>
      </div>
    )
  }

  if (!state.selectedConversationId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">选择一个对话开始交流</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {conversation?.guestName || '对话'}
          </h3>
          {conversation?.bookingId && (
            <p className="text-sm text-bnb-primary">已有预订</p>
          )}
        </div>
        {state.currentRole === 'guest' && (
          <button
            onClick={() => setShowBookingForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-bnb-primary text-white rounded-lg hover:bg-bnb-primary-dark transition-colors text-sm"
          >
            <Calendar className="w-4 h-4" />
            发起预订
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>开始对话吧</p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </div>

      {showBookingForm && state.currentRole === 'guest' && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">发送预订意向</h4>
            <button
              onClick={() => {
                setShowBookingForm(false)
                onDateSelect?.(null, null)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={onShowCalendar}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-bnb-primary transition-colors"
            >
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-left flex-1">
                {selectedStartDate && selectedEndDate
                  ? `${formatDate(
                      formatISO(selectedStartDate, { representation: 'date' })
                    ).slice(5)} - ${formatDate(
                      formatISO(selectedEndDate, { representation: 'date' })
                    ).slice(5)}`
                  : '选择日期'}
              </span>
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
              <Users className="w-4 h-4 text-gray-400" />
              <input
                type="number"
                min="1"
                max="10"
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                className="flex-1 w-16 text-sm outline-none"
              />
              <span className="text-gray-500 text-sm">人</span>
            </div>
          </div>

          {selectedStartDate && selectedEndDate && state.selectedPropertyId && (
            <div className="mb-3 p-3 bg-white rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {calculateNights(
                    formatISO(selectedStartDate, { representation: 'date' }),
                    formatISO(selectedEndDate, { representation: 'date' })
                  )}
                  晚
                </span>
                <span className="font-medium text-bnb-primary text-lg">
                  {formatPrice(calculateTotalPrice())}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleSendBookingRequest}
            disabled={!selectedStartDate || !selectedEndDate}
            className="w-full py-2 bg-bnb-primary text-white rounded-lg hover:bg-bnb-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送预订意向
          </button>
        </div>
      )}

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-bnb-primary"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-2 bg-bnb-primary text-white rounded-full hover:bg-bnb-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
