import React from 'react'
import { Home, User, Building2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { Role } from '@/types'

export const Header: React.FC = () => {
  const { state, dispatch } = useApp()

  const handleRoleChange = (role: Role) => {
    dispatch({ type: 'SET_ROLE', payload: role })
  }

  const selectedProperty = state.properties.find(
    (p) => p.id === state.selectedPropertyId
  )

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-[1920px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-bnb-primary rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                民宿房态交流站
              </h1>
              {selectedProperty && (
                <p className="text-xs text-gray-500">
                  当前房源：{selectedProperty.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleRoleChange('host')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md transition-all text-sm font-medium ${
                  state.currentRole === 'host'
                    ? 'bg-white shadow text-bnb-primary'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                房东
              </button>
              <button
                onClick={() => handleRoleChange('guest')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md transition-all text-sm font-medium ${
                  state.currentRole === 'guest'
                    ? 'bg-white shadow text-bnb-primary'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <User className="w-4 h-4" />
                客人
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-bnb-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-bnb-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-800">
                  {state.currentRole === 'host' ? '房东小王' : '客人小李'}
                </p>
                <p className="text-xs text-gray-500">
                  {state.currentRole === 'host' ? '管理员' : '普通用户'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
