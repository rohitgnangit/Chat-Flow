import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

// Send a message
export const sendMessage = mutation({
  args: {
    senderId: v.string(),
    receiverId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('messages', {
      ...args,
      createdAt: Date.now(),
      read: false, // New field to track if the message has been read
    })
  }
})

// Get messages between two users
export const getMessages = query({
  args: {
    senderId: v.string(),
    receiverId: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db.query('messages')
      .filter(q => 
        q.or(
          q.and(
            q.eq(q.field('senderId'), args.senderId),
            q.eq(q.field('receiverId'), args.receiverId)
          ),
          q.and(
            q.eq(q.field('senderId'), args.receiverId),
            q.eq(q.field('receiverId'), args.senderId)
          )
        )
      )
      .order('asc')
      .collect()
    return messages
  }
})


// Get unread message count
export const getUnreadCount = query({
  args: { senderId: v.string(), receiverId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db.query('messages')
      .filter(q =>
        q.and(
          q.eq(q.field('senderId'), args.senderId),
          q.eq(q.field('receiverId'), args.receiverId),
          q.eq(q.field('read'), false)
        )
      )
      .collect()
    return messages.length
  }
})

// Mark messages as read
export const markAsRead = mutation({
  args: { senderId: v.string(), receiverId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db.query('messages')
      .filter(q =>
        q.and(
          q.eq(q.field('senderId'), args.senderId),
          q.eq(q.field('receiverId'), args.receiverId),
          q.eq(q.field('read'), false)
        )
      )
      .collect()
    await Promise.all(messages.map(msg => ctx.db.patch(msg._id, { read: true })))
  }
})

// Get last message between two users
export const getLastMessage = query({
  args: { senderId: v.string(), receiverId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db.query('messages')
      .filter(q =>
        q.or(
          q.and(
            q.eq(q.field('senderId'), args.senderId),
            q.eq(q.field('receiverId'), args.receiverId)
          ),
          q.and(
            q.eq(q.field('senderId'), args.receiverId),
            q.eq(q.field('receiverId'), args.senderId)
          )
        )
      )
      .order('desc')
      .first()
    return messages
  }
})