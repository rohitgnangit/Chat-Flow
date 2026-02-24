'use client'
import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useEffect } from 'react'

export default function SyncUser() {
  const { user, isLoaded } = useUser()
  const createUser = useMutation(api.users.createUser)

  useEffect(() => {
    if (!isLoaded || !user) return

    createUser({
      clerkId: user.id,
      name: user.fullName ?? '',
      email: user.emailAddresses[0].emailAddress,
      image: user.imageUrl,
    })
  }, [user, isLoaded])

  return null
}