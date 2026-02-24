'use client'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'

const UnreadBadge = ({ senderId, receiverId }: { senderId: string, receiverId: string }) => {
  const { user } = useUser()
  const count = useQuery(api.messages.getUnreadCount, user ? { senderId, receiverId } : "skip")

  if (!count || count === 0) return null

  return (
    <span className="ml-auto bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default UnreadBadge