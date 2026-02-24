"use client"
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'
import { useAuth } from "@clerk/nextjs";
import SyncUser from "@/components/SyncUser";
import OnlineTracker from './OnlineTracker';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

const ConvexProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <SyncUser />
            <OnlineTracker />
            {children}
        </ConvexProviderWithClerk>
    )
}

export default ConvexProviders;