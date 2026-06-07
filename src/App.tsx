import { useState } from 'react'
import { Calendar, MessageSquare, Settings, X } from 'lucide-react'
import { Header } from '@/components/Header'
import { PropertySelector } from '@/components/PropertySelector'
import { Calendar as CalendarComponent } from '@/components/Calendar'
import { BookingList } from '@/components/BookingList'
import { CleaningList } from '@/components/CleaningList'
import { RefundList } from '@/components/RefundList'
import { ConversationList } from '@/components/ConversationList'
import { ChatPanel } from '@/components/ChatPanel'
import { PriceEditor } from '@/components/PriceEditor'
import { useApp } from '@/context/AppContext'

type HostTab = 'calendar' | 'bookings' | 'cleaning' | 'refunds' | 'chat'
type GuestTab = 'calendar' | 'chat' | 'mybookings'
type Tab = HostTab | GuestTab

function App() {
  const { state } = useApp()
  const [hostTab, setHostTab] = useState<HostTab>('calendar')
  const [guestTab, setGuestTab] = useState<GuestTab>('calendar')
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null)
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null)
  const [showChatCalendar, setShowChatCalendar] = useState(false)

  const handleDateSelect = (start: Date | null, end: Date | null) => {
    setSelectedStartDate(start)
    setSelectedEndDate(end)
  }

  const handleShowCalendar = () => {
    setShowChatCalendar(true)
  }

  const hostTabs: Array<{ id: HostTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'calendar', label: '房态日历', icon: Calendar },
    { id: 'bookings', label: '预订管理', icon: Settings },
    { id: 'cleaning', label: '保洁安排', icon: Calendar },
    { id: 'refunds', label: '退款管理', icon: Settings },
    { id: 'chat', label: '消息中心', icon: MessageSquare },
  ]

  const guestTabs: Array<{ id: GuestTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'calendar', label: '查看房源', icon: Calendar },
    { id: 'chat', label: '联系房东', icon: MessageSquare },
    { id: 'mybookings', label: '我的预订', icon: Settings },
  ]

  const currentTabs = state.currentRole === 'host' ? hostTabs : guestTabs
  const currentTab = state.currentRole === 'host' ? hostTab : guestTab
  const setCurrentTab = state.currentRole === 'host' 
    ? (id: Tab) => setHostTab(id as HostTab)
    : (id: Tab) => setGuestTab(id as GuestTab)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-[1920px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-72 flex-shrink-0 space-y-6">
            <PropertySelector />
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="flex border-b border-gray-100">
                {currentTabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = currentTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCurrentTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                        isActive
                          ? 'text-bnb-primary'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-bnb-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {state.currentRole === 'host' ? (
              <>
                {hostTab === 'calendar' && (
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2">
                      <CalendarComponent
                        mode="block"
                        onDateSelect={handleDateSelect}
                        selectedStartDate={selectedStartDate}
                        selectedEndDate={selectedEndDate}
                      />
                    </div>
                    <div className="space-y-6">
                      <PriceEditor
                        selectedStartDate={selectedStartDate}
                        selectedEndDate={selectedEndDate}
                        onDateSelect={handleDateSelect}
                      />
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <h4 className="font-medium text-yellow-800 mb-2">
                          💡 操作提示
                        </h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• 在日历上拖拽选择日期范围</li>
                          <li>• 可批量设置房态（保洁/维护/可订）</li>
                          <li>• 可批量调整日期价格</li>
                          <li>• 周末价格自动上浮20%</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {hostTab === 'bookings' && (
                  <div className="grid grid-cols-2 gap-6">
                    <BookingList />
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          操作说明
                        </h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></span>
                            <span>
                              <strong>确认预订：</strong>
                              待确认的预订点击绿色对勾确认
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></span>
                            <span>
                              <strong>取消预订：</strong>
                              点击红色叉号取消，将自动：
                            </span>
                          </li>
                          <li className="pl-5 text-gray-500">
                            • 日历空出对应日期
                          </li>
                          <li className="pl-5 text-gray-500">
                            • 取消相关保洁安排
                          </li>
                          <li className="pl-5 text-gray-500">
                            • 生成80%退款申请
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {hostTab === 'cleaning' && (
                  <div className="grid grid-cols-2 gap-6">
                    <CleaningList />
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          保洁状态说明
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              已排期
                            </span>
                            <span className="text-sm text-gray-600">
                              待执行的保洁任务
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                              进行中
                            </span>
                            <span className="text-sm text-gray-600">
                              保洁正在进行
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              已完成
                            </span>
                            <span className="text-sm text-gray-600">
                              保洁已完成
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                              已取消
                            </span>
                            <span className="text-sm text-gray-600">
                              预订取消时自动取消
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            💡 预订确认后会自动在退房日生成保洁安排
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {hostTab === 'refunds' && (
                  <div className="grid grid-cols-2 gap-6">
                    <RefundList />
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          退款规则
                        </h3>
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li>• 取消预订自动退款80%房费</li>
                          <li>• 退款申请需房东确认处理</li>
                          <li>• 状态流转：待处理 → 处理中 → 已完成</li>
                          <li>• 如有特殊情况可拒绝退款</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {hostTab === 'chat' && (
                  <div className="grid grid-cols-3 gap-6 h-[calc(100vh-220px)]">
                    <ConversationList />
                    <div className="col-span-2">
                      <ChatPanel
                        onShowCalendar={handleShowCalendar}
                        selectedStartDate={selectedStartDate}
                        selectedEndDate={selectedEndDate}
                        onDateSelect={handleDateSelect}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {guestTab === 'calendar' && (
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2">
                      <CalendarComponent mode="view" />
                    </div>
                    <div className="space-y-6">
                      {state.selectedPropertyId && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                          <div className="aspect-video">
                            <img
                              src={
                                state.properties.find(
                                  (p) => p.id === state.selectedPropertyId
                                )?.images[0]
                              }
                              alt="房源图片"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              {
                                state.properties.find(
                                  (p) => p.id === state.selectedPropertyId
                                )?.name
                              }
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                              {
                                state.properties.find(
                                  (p) => p.id === state.selectedPropertyId
                                )?.description
                              }
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">
                                最多{' '}
                                {
                                  state.properties.find(
                                    (p) => p.id === state.selectedPropertyId
                                  )?.maxGuests
                                }{' '}
                                人
                              </span>
                              <span className="font-medium text-bnb-primary text-lg">
                                ¥
                                {
                                  state.properties.find(
                                    (p) => p.id === state.selectedPropertyId
                                  )?.basePrice
                                }
                                /晚
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-medium text-blue-800 mb-2">
                          💡 预订流程
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>1. 点击「联系房东」进入聊天</li>
                          <li>2. 在聊天中咨询房源信息</li>
                          <li>3. 确认入住人数和日期</li>
                          <li>4. 发送预订意向等待确认</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {guestTab === 'chat' && (
                  <div className="grid grid-cols-3 gap-6 h-[calc(100vh-220px)]">
                    <ConversationList />
                    <div className="col-span-2">
                      <ChatPanel
                        onShowCalendar={handleShowCalendar}
                        selectedStartDate={selectedStartDate}
                        selectedEndDate={selectedEndDate}
                        onDateSelect={handleDateSelect}
                      />
                    </div>
                  </div>
                )}

                {guestTab === 'mybookings' && (
                  <div className="grid grid-cols-2 gap-6">
                    <BookingList />
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          我的预订
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          您可以在这里查看和管理您的预订记录。
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                              待确认
                            </span>
                            <span className="text-sm text-gray-600">
                              等待房东确认
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              已确认
                            </span>
                            <span className="text-sm text-gray-600">
                              预订成功
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                              已取消
                            </span>
                            <span className="text-sm text-gray-600">
                              预订已取消
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            💡 取消预订将退款80%，并在聊天中通知房东
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {showChatCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                选择入住日期
              </h3>
              <button
                onClick={() => setShowChatCalendar(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <CalendarComponent
              mode="select"
              onDateSelect={(start, end) => {
                handleDateSelect(start, end)
                if (start && end) {
                  setShowChatCalendar(false)
                }
              }}
              selectedStartDate={selectedStartDate}
              selectedEndDate={selectedEndDate}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
