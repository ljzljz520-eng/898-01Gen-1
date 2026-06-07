import {
  Property,
  Booking,
  Cleaning,
  Refund,
  Conversation,
  ChatMessage,
  DatePrice,
} from '@/types'
import { addDays, formatISO, startOfDay } from 'date-fns'

const today = startOfDay(new Date())

function generateDatePrices(_propertyId: string, basePrice: number): DatePrice[] {
  const prices: DatePrice[] = []

  for (let i = -10; i < 60; i++) {
    const date = addDays(today, i)
    const dateStr = formatISO(date, { representation: 'date' })

    let price = basePrice
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      price = Math.round(basePrice * 1.2)
    }

    let status: 'available' | 'booked' | 'cleaning' | 'maintenance' = 'available'
    let bookingId: string | undefined

    if (i >= 3 && i <= 5) {
      status = 'booked'
      bookingId = 'booking-1'
    } else if (i >= 10 && i <= 12) {
      status = 'booked'
      bookingId = 'booking-2'
    } else if (i === 20) {
      status = 'cleaning'
    } else if (i >= 30 && i <= 31) {
      status = 'maintenance'
    }

    prices.push({
      date: dateStr,
      price,
      status,
      bookingId,
    })
  }

  return prices
}

export const mockProperties: Property[] = [
  {
    id: 'property-1',
    name: '海景浪漫小屋',
    description: '位于海边的温馨小屋，配备落地窗和私人阳台，可欣赏绝美日落。',
    basePrice: 580,
    maxGuests: 4,
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20beach%20house%20with%20ocean%20view%20sunset&image_size=landscape_16_9',
    ],
  },
  {
    id: 'property-2',
    name: '山景静谧别墅',
    description: '坐落于山林间的独立别墅，空气清新，适合家庭度假。',
    basePrice: 880,
    maxGuests: 6,
    images: [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20mountain%20villa%20with%20forest%20view&image_size=landscape_16_9',
    ],
  },
]

export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    propertyId: 'property-1',
    guestId: 'guest-1',
    guestName: '李先生',
    checkIn: formatISO(addDays(today, 3), { representation: 'date' }),
    checkOut: formatISO(addDays(today, 6), { representation: 'date' }),
    guestCount: 2,
    totalPrice: 1740,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'booking-2',
    propertyId: 'property-1',
    guestId: 'guest-2',
    guestName: '王女士',
    checkIn: formatISO(addDays(today, 10), { representation: 'date' }),
    checkOut: formatISO(addDays(today, 13), { representation: 'date' }),
    guestCount: 3,
    totalPrice: 2088,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
]

export const mockCleanings: Cleaning[] = [
  {
    id: 'cleaning-1',
    propertyId: 'property-1',
    bookingId: 'booking-1',
    date: formatISO(addDays(today, 6), { representation: 'date' }),
    status: 'scheduled',
    cleanerName: '张阿姨',
    notes: '退房后全面保洁',
  },
  {
    id: 'cleaning-2',
    propertyId: 'property-1',
    date: formatISO(addDays(today, 20), { representation: 'date' }),
    status: 'scheduled',
    cleanerName: '李阿姨',
    notes: '深度清洁，更换床上用品',
  },
]

export const mockRefunds: Refund[] = []

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    propertyId: 'property-1',
    hostId: 'host-1',
    guestId: 'guest-1',
    guestName: '李先生',
    lastMessage: '好的，期待入住！',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0,
    bookingId: 'booking-1',
  },
  {
    id: 'conv-2',
    propertyId: 'property-1',
    hostId: 'host-1',
    guestId: 'guest-2',
    guestName: '王女士',
    lastMessage: '请问可以带宠物吗？',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 1,
    bookingId: 'booking-2',
  },
  {
    id: 'conv-3',
    propertyId: 'property-1',
    hostId: 'host-1',
    guestId: 'guest-3',
    guestName: '张先生',
    lastMessage: '你好，我想咨询一下房间',
    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 2,
  },
]

export const mockMessages: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'guest-1',
      senderRole: 'guest',
      content: '你好，我想预订6月10日到6月13日的房间，2个人',
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      type: 'text',
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'host-1',
      senderRole: 'host',
      content: '好的，这几天正好有空房。2人入住3晚，总价是1740元',
      timestamp: new Date(Date.now() - 86400000 * 3 + 60000).toISOString(),
      type: 'text',
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'guest-1',
      senderRole: 'guest',
      content: '确认入住时间：6月10日-6月13日，人数2人',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      type: 'booking_request',
      bookingData: {
        checkIn: formatISO(addDays(today, 3), { representation: 'date' }),
        checkOut: formatISO(addDays(today, 6), { representation: 'date' }),
        guestCount: 2,
        totalPrice: 1740,
      },
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      senderId: 'host-1',
      senderRole: 'host',
      content: '预订已确认！',
      timestamp: new Date(Date.now() - 86400000 * 2 + 300000).toISOString(),
      type: 'booking_confirm',
      bookingId: 'booking-1',
      bookingData: {
        checkIn: formatISO(addDays(today, 3), { representation: 'date' }),
        checkOut: formatISO(addDays(today, 6), { representation: 'date' }),
        guestCount: 2,
        totalPrice: 1740,
      },
    },
    {
      id: 'msg-5',
      conversationId: 'conv-1',
      senderId: 'guest-1',
      senderRole: 'guest',
      content: '好的，期待入住！',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: 'text',
    },
  ],
  'conv-2': [
    {
      id: 'msg-6',
      conversationId: 'conv-2',
      senderId: 'guest-2',
      senderRole: 'guest',
      content: '你好，请问6月17日到20日有空房吗？我们3个人',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: 'text',
    },
    {
      id: 'msg-7',
      conversationId: 'conv-2',
      senderId: 'host-1',
      senderRole: 'host',
      content: '有的，3人入住3晚，总价2088元',
      timestamp: new Date(Date.now() - 86400000 + 300000).toISOString(),
      type: 'text',
    },
    {
      id: 'msg-8',
      conversationId: 'conv-2',
      senderId: 'guest-2',
      senderRole: 'guest',
      content: '确认：6月17日-6月20日，3人入住',
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      type: 'booking_request',
      bookingData: {
        checkIn: formatISO(addDays(today, 10), { representation: 'date' }),
        checkOut: formatISO(addDays(today, 13), { representation: 'date' }),
        guestCount: 3,
        totalPrice: 2088,
      },
    },
    {
      id: 'msg-9',
      conversationId: 'conv-2',
      senderId: 'guest-2',
      senderRole: 'guest',
      content: '请问可以带宠物吗？',
      timestamp: new Date().toISOString(),
      type: 'text',
    },
  ],
  'conv-3': [
    {
      id: 'msg-10',
      conversationId: 'conv-3',
      senderId: 'guest-3',
      senderRole: 'guest',
      content: '你好，我想咨询一下房间',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'text',
    },
  ],
}

export const mockData = {
  properties: mockProperties,
  bookings: mockBookings,
  cleanings: mockCleanings,
  refunds: mockRefunds,
  conversations: mockConversations,
  messages: mockMessages,
  datePrices: {
    'property-1': generateDatePrices('property-1', 580),
    'property-2': generateDatePrices('property-2', 880),
  },
}
