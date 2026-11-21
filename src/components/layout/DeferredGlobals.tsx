'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { inject } from '@vercel/analytics'
import { RateLimitDialog } from '@/components/layout/RateLimitDialog'
import { SearchDialog } from '@/components/search/SearchDialog'
import { DailyRecap } from '@/components/layout/DailyRecap'

// Loaded as separate chunks and mounted after hydration, so they stay out of the initial page bundle
const WelcomeDialog = dynamic(() => import('@/components/layout/WelcomeDialog').then(m => m.WelcomeDialog), { ssr: false })
const FeatureTour = dynamic(() => import('@/components/layout/FeatureTour').then(m => m.FeatureTour), { ssr: false })
const ProfileIntro = dynamic(() => import('@/components/profile/ProfileIntro').then(m => m.ProfileIntro), { ssr: false })
const MilestoneWatcher = dynamic(() => import('@/components/layout/MilestoneWatcher').then(m => m.MilestoneWatcher), { ssr: false })
const SignInDialog = dynamic(() => import('@/components/auth/SignInDialog').then(m => m.SignInDialog), { ssr: false })

// Page view tracking loads after the page is interactive. inject() also tracks client-side route changes.
export function DeferredGlobals() {
  useEffect(() => {
    inject()
  }, [])

  return (
    <>
      <WelcomeDialog />
      <FeatureTour />
      <ProfileIntro />
      <MilestoneWatcher />
      <SignInDialog />
      <RateLimitDialog />
      <SearchDialog />
      <DailyRecap />
    </>
  )
}
