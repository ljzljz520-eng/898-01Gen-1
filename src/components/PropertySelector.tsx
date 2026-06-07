import React from 'react'
import { Users, DollarSign } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { formatPrice } from '@/utils/helpers'

export const PropertySelector: React.FC = () => {
  const { state, dispatch } = useApp()

  const handleSelectProperty = (id: string) => {
    dispatch({ type: 'SET_SELECTED_PROPERTY', payload: id })
    dispatch({ type: 'SET_SELECTED_CONVERSATION', payload: null })
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
        房源列表
      </h3>
      <div className="space-y-2">
        {state.properties.map((property) => (
          <button
            key={property.id}
            onClick={() => handleSelectProperty(property.id)}
            className={`w-full text-left p-3 rounded-lg transition-all ${
              state.selectedPropertyId === property.id
                ? 'bg-bnb-primary/10 border-2 border-bnb-primary'
                : 'bg-white border-2 border-transparent hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-medium truncate ${
                    state.selectedPropertyId === property.id
                      ? 'text-bnb-primary'
                      : 'text-gray-800'
                  }`}
                >
                  {property.name}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {property.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>{formatPrice(property.basePrice)}/晚</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>最多{property.maxGuests}人</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
