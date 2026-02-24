'use client'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'

const LastMessage = ({ otherUserId }: { otherUserId: string }) => {
  const { user } = useUser()
  const lastMsg = useQuery(api.messages.getLastMessage,
    user ? { senderId: user.id, receiverId: otherUserId } : 'skip'
  )

  if (!lastMsg) return <span className="text-xs text-slate-400">No messages yet</span>

  const time = new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const isMe = lastMsg.senderId === user?.id

  return (
    <div className="flex justify-between items-center w-full">
      <span className="text-xs text-slate-400 truncate max-w-[120px]">
        {isMe ? 'You: ' : ''}{lastMsg.content}
      </span>
      <span className="text-xs text-slate-400 ml-2">{time}</span>
    </div>
  )
}

export default LastMessage