import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        name:v.string(),
        email:v.string(),
        image:v.string(),
        isOnline: v.optional(v.boolean()), 
        isTyping: v.optional(v.boolean()), 
    }),
    messages: defineTable({
        senderId: v.string(),   // clerkId of sender
        receiverId: v.string(), // clerkId of receiver
        content: v.string(),
        createdAt: v.number(),
        read: v.optional(v.boolean()), 
        isDeleted: v.optional(v.boolean()), 
  })
})