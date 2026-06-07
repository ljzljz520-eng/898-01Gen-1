import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import {
  AppState,
  Role,
  Property,
  Booking,
  Cleaning,
  Refund,
  Conversation,
  ChatMessage,
  DatePrice,
  BookingStatus,
  CleaningStatus,
  RefundStatus,
  RoomStatus,
} from '@/types'
import {
  addDays,
  formatISO,
  startOfDay,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns'
import { generateId } from '@/utils/helpers'
import { mockData } from '@/data/mockData'

type AppAction =
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'SET_SELECTED_PROPERTY'; payload: string | null }
  | { type: 'SET_SELECTED_CONVERSATION'; payload: string | null }
  | { type: 'UPDATE_DATE_PRICE'; payload: { propertyId: string; datePrice: DatePrice } }
  | { type: 'BLOCK_DATES'; payload: { propertyId: string; dates: string[]; status: RoomStatus } }
  | { type: 'CREATE_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING'; payload: Booking }
  | { type: 'CANCEL_BOOKING'; payload: { bookingId: string; reason: string } }
  | { type: 'CREATE_CLEANING'; payload: Cleaning }
  | { type: 'UPDATE_CLEANING'; payload: Cleaning }
  | { type: 'SEND_MESSAGE'; payload: { conversationId: string; message: ChatMessage } }
  | { type: 'MARK_CONVERSATION_READ'; payload: string }
  | { type: 'CREATE_CONVERSATION'; payload: Conversation }

const initialState: AppState = {
  currentRole: 'host',
  currentUserId: 'host-1',
  properties: mockData.properties,
  bookings: mockData.bookings,
  cleanings: mockData.cleanings,
  refunds: mockData.refunds,
  conversations: mockData.conversations,
  messages: mockData.messages,
  datePrices: mockData.datePrices,
  selectedPropertyId: mockData.properties[0]?.id || null,
  selectedConversationId: null,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ROLE': {
      const newRole = action.payload
      return {
        ...state,
        currentRole: newRole,
        currentUserId: newRole === 'host' ? 'host-1' : 'guest-1',
        selectedConversationId: null,
      }
    }

    case 'SET_SELECTED_PROPERTY':
      return { ...state, selectedPropertyId: action.payload }

    case 'SET_SELECTED_CONVERSATION':
      return { ...state, selectedConversationId: action.payload }

    case 'UPDATE_DATE_PRICE': {
      const { propertyId, datePrice } = action.payload
      const currentPrices = state.datePrices[propertyId] || []
      const existingIndex = currentPrices.findIndex((dp) => dp.date === datePrice.date)

      let newPrices: DatePrice[]
      if (existingIndex >= 0) {
        newPrices = [...currentPrices]
        newPrices[existingIndex] = datePrice
      } else {
        newPrices = [...currentPrices, datePrice]
      }

      return {
        ...state,
        datePrices: {
          ...state.datePrices,
          [propertyId]: newPrices,
        },
      }
    }

    case 'BLOCK_DATES': {
      const { propertyId, dates, status } = action.payload
      const currentPrices = state.datePrices[propertyId] || []

      const updatedPrices = currentPrices.map((dp) => {
        if (dates.includes(dp.date)) {
          return { ...dp, status }
        }
        return dp
      })

      dates.forEach((date) => {
        if (!updatedPrices.find((dp) => dp.date === date)) {
          const property = state.properties.find((p) => p.id === propertyId)
          updatedPrices.push({
            date,
            price: property?.basePrice || 0,
            status,
          })
        }
      })

      return {
        ...state,
        datePrices: {
          ...state.datePrices,
          [propertyId]: updatedPrices,
        },
      }
    }

    case 'CREATE_BOOKING': {
      const booking = action.payload
      const propertyId = booking.propertyId
      const checkIn = new Date(booking.checkIn)
      const checkOut = new Date(booking.checkOut)
      const dates = eachDayOfInterval({ start: checkIn, end: addDays(checkOut, -1) }).map((d) =>
        formatISO(startOfDay(d), { representation: 'date' }),
      )

      const currentPrices = state.datePrices[propertyId] || []
      const updatedPrices = currentPrices.map((dp) => {
        if (dates.includes(dp.date)) {
          return { ...dp, status: 'booked' as RoomStatus, bookingId: booking.id }
        }
        return dp
      })

      const cleaningDate = formatISO(checkOut, { representation: 'date' })
      const newCleaning: Cleaning = {
        id: generateId(),
        propertyId,
        bookingId: booking.id,
        date: cleaningDate,
        status: 'scheduled' as CleaningStatus,
        cleanerName: '张阿姨',
      }

      return {
        ...state,
        bookings: [...state.bookings, booking],
        cleanings: [...state.cleanings, newCleaning],
        datePrices: {
          ...state.datePrices,
          [propertyId]: updatedPrices,
        },
      }
    }

    case 'UPDATE_BOOKING': {
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.payload.id ? action.payload : b,
        ),
      }
    }

    case 'CANCEL_BOOKING': {
      const { bookingId, reason } = action.payload
      const booking = state.bookings.find((b) => b.id === bookingId)
      if (!booking) return state

      const propertyId = booking.propertyId
      const checkIn = new Date(booking.checkIn)
      const checkOut = new Date(booking.checkOut)
      const dates = eachDayOfInterval({ start: checkIn, end: addDays(checkOut, -1) }).map((d) =>
        formatISO(startOfDay(d), { representation: 'date' }),
      )

      const currentPrices = state.datePrices[propertyId] || []
      const updatedPrices = currentPrices.map((dp) => {
        if (dates.includes(dp.date) && dp.bookingId === bookingId) {
          return { ...dp, status: 'available' as RoomStatus, bookingId: undefined }
        }
        return dp
      })

      const updatedCleanings = state.cleanings.map((c) =>
        c.bookingId === bookingId ? { ...c, status: 'cancelled' as CleaningStatus } : c,
      )

      const refund: Refund = {
        id: generateId(),
        bookingId,
        amount: booking.totalPrice * 0.8,
        status: 'pending' as RefundStatus,
        reason,
        createdAt: new Date().toISOString(),
      }

      const updatedBookings = state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b,
      )

      return {
        ...state,
        bookings: updatedBookings,
        cleanings: updatedCleanings,
        refunds: [...state.refunds, refund],
        datePrices: {
          ...state.datePrices,
          [propertyId]: updatedPrices,
        },
      }
    }

    case 'CREATE_CLEANING':
      return {
        ...state,
        cleanings: [...state.cleanings, action.payload],
      }

    case 'UPDATE_CLEANING':
      return {
        ...state,
        cleanings: state.cleanings.map((c) =>
          c.id === action.payload.id ? action.payload : c,
        ),
      }

    case 'SEND_MESSAGE': {
      const { conversationId, message } = action.payload
      const currentMessages = state.messages[conversationId] || []
      const updatedConversations = state.conversations.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: message.content,
            lastMessageTime: message.timestamp,
            unreadCount: state.currentRole === 'host' ? c.unreadCount + 1 : c.unreadCount,
            bookingId: message.bookingId || c.bookingId,
          }
        }
        return c
      })

      return {
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: [...currentMessages, message],
        },
        conversations: updatedConversations,
      }
    }

    case 'MARK_CONVERSATION_READ': {
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.payload ? { ...c, unreadCount: 0 } : c,
        ),
      }
    }

    case 'CREATE_CONVERSATION': {
      return {
        ...state,
        conversations: [...state.conversations, action.payload],
        messages: {
          ...state.messages,
          [action.payload.id]: [],
        },
      }
    }

    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  getDatePrice: (propertyId: string, date: Date) => DatePrice | undefined
  isDateAvailable: (propertyId: string, date: Date) => boolean
  getBookingsForProperty: (propertyId: string) => Booking[]
  getCleaningsForProperty: (propertyId: string) => Cleaning[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const getDatePrice = (propertyId: string, date: Date): DatePrice | undefined => {
    const dateStr = formatISO(startOfDay(date), { representation: 'date' })
    const prices = state.datePrices[propertyId] || []
    return prices.find((dp) => dp.date === dateStr)
  }

  const isDateAvailable = (propertyId: string, date: Date): boolean => {
    const dp = getDatePrice(propertyId, date)
    if (!dp) return true
    return dp.status === 'available'
  }

  const getBookingsForProperty = (propertyId: string): Booking[] => {
    return state.bookings.filter((b) => b.propertyId === propertyId)
  }

  const getCleaningsForProperty = (propertyId: string): Cleaning[] => {
    return state.cleanings.filter((c) => c.propertyId === propertyId)
  }

  return (
    <AppContext.Provider
      value={{
      state,
      dispatch,
      getDatePrice,
      isDateAvailable,
      getBookingsForProperty,
      getCleaningsForProperty,
    }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
