import { mutation, query } from "./_generated/server";
import { v } from 'convex/values'

export const createUser = mutation( {
    args: {
        clerkId:v.string(),
        name:v.string(),
        email:v.string(),
        image:v.string(),
    },
    handler: async (ctx, args) => {
        // Check if user already exists
        const existing = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
            .first();
        if (existing) {
            return; // User already exists, do nothing
        }
        return await ctx.db.insert("users", {
            ...args,
            isOnline: false, // default to offline
        });
    }
})

// Getting Currusers to show in the sidebar
export const getCurrentUser = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
            .first();
    }
})

// Getting all users
export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect()
  }
})

// For setting user online/offline status
export const setOnline = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query('users')
      .filter(q => q.eq(q.field('clerkId'), args.clerkId))
      .first()
    if (user) await ctx.db.patch(user._id, { isOnline: true })
  }
})

export const setOffline = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query('users')
      .filter(q => q.eq(q.field('clerkId'), args.clerkId))
      .first()
    if (user) await ctx.db.patch(user._id, { isOnline: false })
  }
})

// For setting user typing status
export const setTyping = mutation({
  args: { clerkId: v.string(), isTyping: v.boolean() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query('users')
      .filter(q => q.eq(q.field('clerkId'), args.clerkId))
      .first()
    if (user) await ctx.db.patch(user._id, { isTyping: args.isTyping })
  }
})