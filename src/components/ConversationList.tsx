import React from 'react'
import { MessageCircle, User } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { formatTime } from '@/utils/helpers'

export const ConversationList: React.FC = () => {
  const { state, dispatch } = useApp()

  const conversations = state.conversations.filter((c) => {
    if (state.currentRole === 'host') {
      return c.propertyId === state.selectedPropertyId
    } else {
      return c.guestId === state.currentUserId
    }
  })

  const handleSelectConversation = (id: string) => {
    dispatch({ type: 'SET_SELECTED_CONVERSATION', payload: id })
    dispatch({ type: 'MARK_CONVERSATION_READ', payload: id })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">
          {state.currentRole === 'host' ? '客人咨询' : '我的咨询'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          共 {conversations.length} 个对话
        </p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>暂无对话</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                state.selectedConversationId === conv.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-bnb-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-bnb-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800 truncate">
                    {conv.guestName}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {formatTime(conv.lastMessageTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 truncate">
                    {conv.lastMessage}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="ml-2 bg-bnb-primary text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
