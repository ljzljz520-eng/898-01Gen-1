export type Role = 'host' | 'guest'

export type RoomStatus = 'available' | 'booked' | 'cleaning' | 'maintenance'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export type CleaningStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export type RefundStatus = 'none' | 'pending' | 'processing' | 'completed' | 'rejected'

export interface DatePrice {
  date: string
  price: number
  status: RoomStatus
  bookingId?: string
}

export interface Property {
  id: string
  name: string
  description: string
  basePrice: number
  maxGuests: number
  images: string[]
}

export interface Guest {
  id: string
  name: string
  avatar: string
  phone: string
}

export interface Host {
  id: string
  name: string
  avatar: string
}

export interface Booking {
  id: string
  propertyId: string
  guestId: string
  guestName: string
  checkIn: string
  checkOut: string
  guestCount: number
  totalPrice: number
  status: BookingStatus
  createdAt: string
  messageId?: string
}

export interface Cleaning {
  id: string
  propertyId: string
  bookingId?: string
  date: string
  status: CleaningStatus
  cleanerName?: string
  notes?: string
}

export interface Refund {
  id: string
  bookingId: string
  amount: number
  status: RefundStatus
  reason: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderRole: Role
  content: string
  timestamp: string
  type: 'text' | 'booking_request' | 'booking_confirm' | 'booking_cancel'
  bookingData?: {
    checkIn: string
    checkOut: string
    guestCount: number
    totalPrice: number
  }
  bookingId?: string
}

export interface Conversation {
  id: string
  propertyId: string
  hostId: string
  guestId: string
  guestName: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  bookingId?: string
}

export interface AppState {
  currentRole: Role
  currentUserId: string
  properties: Property[]
  bookings: Booking[]
  cleanings: Cleaning[]
  refunds: Refund[]
  conversations: Conversation[]
  messages: Record<string, ChatMessage[]>
  datePrices: Record<string, DatePrice[]>
  selectedPropertyId: string | null
  selectedConversationId: string | null
}
