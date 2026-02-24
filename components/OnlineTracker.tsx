'use client'
import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useEffect } from 'react'

export default function OnlineTracker() {
  const { user } = useUser()
  const setOnline = useMutation(api.users.setOnline)
  const setOffline = useMutation(api.users.setOffline)

  useEffect(() => {
    if (!user) return

    // Set online when app opens
    setOnline({ clerkId: user.id })

    // Set offline when tab closes or user leaves
    const handleOffline = () => setOffline({ clerkId: user.id })
    window.addEventListener('beforeunload', handleOffline)

    return () => {
      window.removeEventListener('beforeunload', handleOffline)
      setOffline({ clerkId: user.id })
    }
  }, [user])

  return null
}