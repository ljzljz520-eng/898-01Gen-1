import React, { useState } from 'react'
import { DollarSign, Edit3, Save, X } from 'lucide-react'
import { formatISO, startOfDay, addDays, eachDayOfInterval } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { formatPrice } from '@/utils/helpers'

interface PriceEditorProps {
  selectedStartDate: Date | null
  selectedEndDate: Date | null
  onDateSelect: (start: Date | null, end: Date | null) => void
}

export const PriceEditor: React.FC<PriceEditorProps> = ({
  selectedStartDate,
  selectedEndDate,
  onDateSelect,
}) => {
  const { state, dispatch } = useApp()
  const [newPrice, setNewPrice] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const property = state.properties.find((p) => p.id === state.selectedPropertyId)

  const handleApplyPrice = () => {
    if (
      !state.selectedPropertyId ||
      !selectedStartDate ||
      !selectedEndDate ||
      !newPrice
    )
      return

    const price = parseInt(newPrice)
    if (isNaN(price) || price <= 0) return

    const dates = eachDayOfInterval({
      start: selectedStartDate,
      end: addDays(selectedEndDate, -1),
    })

    dates.forEach((date) => {
      const dateStr = formatISO(startOfDay(date), { representation: 'date' })
      const currentPrices = state.datePrices[state.selectedPropertyId!] || []
      const existing = currentPrices.find((dp) => dp.date === dateStr)

      dispatch({
        type: 'UPDATE_DATE_PRICE',
        payload: {
          propertyId: state.selectedPropertyId!,
          datePrice: {
            date: dateStr,
            price,
            status: existing?.status || 'available',
          },
        },
      })
    })

    setIsEditing(false)
    setNewPrice('')
    onDateSelect(null, null)
  }

  const calculateAveragePrice = () => {
    if (
      !state.selectedPropertyId ||
      !selectedStartDate ||
      !selectedEndDate
    )
      return 0

    const dates = eachDayOfInterval({
      start: selectedStartDate,
      end: addDays(selectedEndDate, -1),
    })

    const prices = dates
      .map((d) => {
        const dps = state.datePrices[state.selectedPropertyId!] || []
        return dps.find((dp) => dp.date === formatISO(startOfDay(d), { representation: 'date' }))?.price || property?.basePrice || 0
      })
      .filter((p) => p > 0)

    if (prices.length === 0) return 0
    return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
  }

  if (!property) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">价格管理</h3>
        <div className="text-sm text-gray-500">
          基础价格：
          <span className="font-medium text-bnb-primary">
            {formatPrice(property.basePrice)}/晚
          </span>
        </div>
      </div>

      {selectedStartDate && selectedEndDate ? (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">已选择日期</span>
              <button
                onClick={() => onDateSelect(null, null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="font-medium text-gray-800">
              {selectedStartDate.toLocaleDateString('zh-CN')} -{' '}
              {selectedEndDate.toLocaleDateString('zh-CN')}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              当前均价：{formatPrice(calculateAveragePrice())}/晚
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  设置新价格（/晚）
                </label>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="输入价格"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bnb-primary focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setNewPrice('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleApplyPrice}
                  disabled={!newPrice || parseInt(newPrice) <= 0}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-bnb-primary text-white rounded-lg hover:bg-bnb-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  应用价格
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsEditing(true)
                setNewPrice(calculateAveragePrice().toString())
              }}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-bnb-primary text-white rounded-lg hover:bg-bnb-primary-dark transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              批量设置价格
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <DollarSign className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">在日历上选择日期范围来设置价格</p>
          <p className="text-xs text-gray-400 mt-1">
            周末自动加价20%，可手动调整
          </p>
        </div>
      )}
    </div>
  )
}
