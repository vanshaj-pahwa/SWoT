'use client'

import { ProfileForm } from '@/components/auth/ProfileForm'
import { DashboardLayout } from '@/components/shared/DashboardLayout'

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>
        <ProfileForm />
      </div>
    </DashboardLayout>
  )
}