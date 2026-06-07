import React, { useState } from 'react'
import { Sparkles, Clock, CheckCircle, XCircle, User, Calendar, Plus } from 'lucide-react'
import { formatISO, startOfDay } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { CleaningStatus } from '@/types'
import { formatDate, getStatusText, getStatusColor, generateId } from '@/utils/helpers'

export const CleaningList: React.FC = () => {
  const { state, dispatch, getCleaningsForProperty } = useApp()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCleaning, setNewCleaning] = useState({
    date: '',
    cleanerName: '张阿姨',
    notes: '',
  })

  const cleanings = state.selectedPropertyId
    ? getCleaningsForProperty(state.selectedPropertyId)
    : state.cleanings

  const handleUpdateStatus = (id: string, status: CleaningStatus) => {
    const cleaning = state.cleanings.find((c) => c.id === id)
    if (cleaning) {
      dispatch({
        type: 'UPDATE_CLEANING',
        payload: { ...cleaning, status },
      })
    }
  }

  const handleAddCleaning = () => {
    if (!state.selectedPropertyId || !newCleaning.date) return

    dispatch({
      type: 'CREATE_CLEANING',
      payload: {
        id: generateId(),
        propertyId: state.selectedPropertyId,
        date: newCleaning.date,
        status: 'scheduled',
        cleanerName: newCleaning.cleanerName,
        notes: newCleaning.notes,
      },
    })

    setShowAddModal(false)
    setNewCleaning({ date: '', cleanerName: '张阿姨', notes: '' })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">保洁安排</h3>
          <p className="text-sm text-gray-500 mt-1">
            共 {cleanings.length} 条保洁记录
          </p>
        </div>
        {state.currentRole === 'host' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-bnb-primary text-white rounded-lg hover:bg-bnb-primary-dark transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            添加保洁
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        {cleanings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>暂无保洁安排</p>
          </div>
        ) : (
          cleanings.map((cleaning) => (
            <div
              key={cleaning.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        cleaning.status
                      )}`}
                    >
                      {getStatusText(cleaning.status)}
                    </span>
                    {cleaning.bookingId && (
                      <span className="text-xs text-gray-500">
                        （退房保洁）
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(cleaning.date)}</span>
                    </div>
                    {cleaning.cleanerName && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{cleaning.cleanerName}</span>
                      </div>
                    )}
                    {cleaning.notes && (
                      <p className="text-gray-500 text-xs mt-1">
                        备注：{cleaning.notes}
                      </p>
                    )}
                  </div>
                </div>

                {state.currentRole === 'host' &&
                  cleaning.status !== 'completed' &&
                  cleaning.status !== 'cancelled' && (
                    <div className="flex gap-2 ml-4">
                      {cleaning.status === 'scheduled' && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(cleaning.id, 'in_progress')
                          }
                          className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                          title="开始保洁"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      {cleaning.status === 'in_progress' && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(cleaning.id, 'completed')
                          }
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="完成保洁"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {cleaning.status !== 'cancelled' && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(cleaning.id, 'cancelled')
                          }
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="取消保洁"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              添加保洁安排
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  保洁日期
                </label>
                <input
                  type="date"
                  value={newCleaning.date}
                  onChange={(e) =>
                    setNewCleaning({ ...newCleaning, date: e.target.value })
                  }
                  min={formatISO(startOfDay(new Date()), {
                    representation: 'date',
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bnb-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  保洁人员
                </label>
                <select
                  value={newCleaning.cleanerName}
                  onChange={(e) =>
                    setNewCleaning({ ...newCleaning, cleanerName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bnb-primary focus:border-transparent"
                >
                  <option value="张阿姨">张阿姨</option>
                  <option value="李阿姨">李阿姨</option>
                  <option value="王阿姨">王阿姨</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注
                </label>
                <textarea
                  value={newCleaning.notes}
                  onChange={(e) =>
                    setNewCleaning({ ...newCleaning, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bnb-primary focus:border-transparent"
                  rows={3}
                  placeholder="请输入备注信息..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddCleaning}
                disabled={!newCleaning.date}
                className="flex-1 px-4 py-2 bg-bnb-primary text-white rounded-lg hover:bg-bnb-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
