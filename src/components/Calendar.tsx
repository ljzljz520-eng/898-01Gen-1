import React, { useState, useMemo } from 'react'
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  formatISO,
  startOfDay,
  isBefore,
  addDays,
} from 'date-fns'

import { ChevronLeft, ChevronRight, Sparkles, Wrench, Trash2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { RoomStatus, DatePrice } from '@/types'
import { formatPrice, getStatusText } from '@/utils/helpers'

interface CalendarProps {
  mode?: 'view' | 'select' | 'block'
  onDateSelect?: (startDate: Date | null, endDate: Date | null) => void
  selectedStartDate?: Date | null
  selectedEndDate?: Date | null
}

export const Calendar: React.FC<CalendarProps> = ({
  mode = 'view',
  onDateSelect,
  selectedStartDate,
  selectedEndDate,
}) => {
  const { state, getDatePrice, isDateAvailable, dispatch } = useApp()
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()))
  const [selectingMode, setSelectingMode] = useState<'start' | 'end'>('start')

  const propertyId = state.selectedPropertyId

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  const weekDays = ['一', '二', '三', '四', '五', '六', '日']

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const isInRange = (day: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false
    const dayStart = startOfDay(day)
    return (
      (dayStart > startOfDay(selectedStartDate) && dayStart < startOfDay(selectedEndDate)) ||
      isSameDay(dayStart, selectedStartDate) ||
      isSameDay(dayStart, selectedEndDate)
    )
  }

  const isStartDate = (day: Date) =>
    selectedStartDate ? isSameDay(day, selectedStartDate) : false
  const isEndDate = (day: Date) =>
    selectedEndDate ? isSameDay(day, selectedEndDate) : false

  const handleDayClick = (day: Date) => {
    if (mode !== 'select' || !propertyId) return

    const dayStart = startOfDay(day)
    const today = startOfDay(new Date())

    if (isBefore(dayStart, today)) return

    if (selectingMode === 'start') {
      if (!isDateAvailable(propertyId, dayStart)) return
      onDateSelect?.(dayStart, null)
      setSelectingMode('end')
    } else {
      if (selectedStartDate) {
        if (isBefore(dayStart, selectedStartDate) || isSameDay(dayStart, selectedStartDate)) {
          if (!isDateAvailable(propertyId, dayStart)) return
          onDateSelect?.(dayStart, null)
          setSelectingMode('end')
          return
        }

        const dates = eachDayOfInterval({
          start: selectedStartDate,
          end: addDays(dayStart, -1),
        })
        const allAvailable = dates.every((d) => isDateAvailable(propertyId, d))

        if (allAvailable) {
          onDateSelect?.(selectedStartDate, dayStart)
          setSelectingMode('start')
        }
      }
    }
  }

  const getDayStatus = (day: Date): { status: RoomStatus; price: number; dp?: DatePrice } => {
    if (!propertyId) return { status: 'available', price: 0 }
    const dp = getDatePrice(propertyId, day)
    const property = state.properties.find((p) => p.id === propertyId)
    return {
      status: dp?.status || 'available',
      price: dp?.price || property?.basePrice || 0,
      dp,
    }
  }

  const handleBlockDates = (status: RoomStatus) => {
    if (!propertyId || !selectedStartDate || !selectedEndDate) return

    const dates = eachDayOfInterval({
      start: selectedStartDate,
      end: addDays(selectedEndDate, -1),
    }).map((d) => formatISO(startOfDay(d), { representation: 'date' }))

    dispatch({
      type: 'BLOCK_DATES',
      payload: { propertyId, dates, status },
    })

    onDateSelect?.(null, null)
  }

  const handleResetPrice = () => {
    if (!propertyId || !selectedStartDate || !selectedEndDate) return

    const property = state.properties.find((p) => p.id === propertyId)
    if (!property) return

    const dates = eachDayOfInterval({
      start: selectedStartDate,
      end: addDays(selectedEndDate, -1),
    })

    dates.forEach((date) => {
      const dayOfWeek = date.getDay()
      let price = property.basePrice
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        price = Math.round(property.basePrice * 1.2)
      }

      dispatch({
        type: 'UPDATE_DATE_PRICE',
        payload: {
          propertyId,
          datePrice: {
            date: formatISO(startOfDay(date), { representation: 'date' }),
            price,
            status: 'available',
          },
        },
      })
    })

    onDateSelect?.(null, null)
  }

  const renderDayStatusColor = (status: RoomStatus, isRange: boolean, isStart: boolean, isEnd: boolean) => {
    if (isStart || isEnd) return 'bg-bnb-primary text-white'
    if (isRange) return 'bg-bnb-primary/20 text-bnb-primary-dark'

    switch (status) {
      case 'booked':
        return 'bg-red-100 text-red-800 line-through'
      case 'cleaning':
        return 'bg-yellow-100 text-yellow-800'
      case 'maintenance':
        return 'bg-gray-200 text-gray-600'
      case 'available':
      default:
        return 'hover:bg-gray-100'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="text-lg font-semibold text-gray-800">
          {currentMonth.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
          })}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const { status, price } = getDayStatus(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isPast = isBefore(day, startOfDay(new Date()))
          const isRange = isInRange(day)
          const isStart = isStartDate(day)
          const isEnd = isEndDate(day)
          const disabled = isPast || (mode === 'select' && status !== 'available')

          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              disabled={disabled}
              className={`
                relative p-1 min-h-[60px] rounded-lg transition-all
                ${isCurrentMonth ? '' : 'opacity-30'}
                ${renderDayStatusColor(status, isRange, isStart, isEnd)}
                ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="text-sm font-medium">{day.getDate()}</div>
              {isCurrentMonth && price > 0 && (
                <div className="text-xs mt-1">
                  {formatPrice(price)}
                </div>
              )}
              {status !== 'available' && isCurrentMonth && (
                <div className="text-[10px] mt-0.5 opacity-80">
                  {getStatusText(status)}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100"></div>
          <span className="text-sm text-gray-600">可订</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100"></div>
          <span className="text-sm text-gray-600">已预订</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-100"></div>
          <span className="text-sm text-gray-600">保洁中</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-200"></div>
          <span className="text-sm text-gray-600">维护中</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-bnb-primary"></div>
          <span className="text-sm text-gray-600">已选择</span>
        </div>
      </div>

      {mode === 'block' && selectedStartDate && selectedEndDate && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-600 mb-3">
            已选择：
            <span className="font-medium text-gray-800">
              {selectedStartDate.toLocaleDateString('zh-CN')} - {selectedEndDate.toLocaleDateString('zh-CN')}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBlockDates('cleaning')}
              className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
            >
              <Sparkles className="w-4 h-4" />
              设为保洁
            </button>
            <button
              onClick={() => handleBlockDates('maintenance')}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              <Wrench className="w-4 h-4" />
              设为维护
            </button>
            <button
              onClick={() => handleBlockDates('available')}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              解除封锁
            </button>
            <button
              onClick={handleResetPrice}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              重置价格
            </button>
          </div>
        </div>
      )}

      {mode === 'select' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {selectingMode === 'start'
              ? '请选择入住日期'
              : '请选择退房日期，或点击其他日期重新选择入住日'}
          </p>
        </div>
      )}
    </div>
  )
}
