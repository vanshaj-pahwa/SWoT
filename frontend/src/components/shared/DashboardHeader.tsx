'use client'

import { Search, MessageCircle, Bell, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export function DashboardHeader() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
            />
          </div>
        </div>

        {/* Mobile Spacer */}
        <div className="flex-1 md:hidden"></div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4 md:ml-6">
          {/* Icons - Hidden on mobile */}
          <button className="hidden md:block p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <MessageCircle className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <button 
            onClick={() => router.push('/profile')}
            className="flex items-center gap-3 pl-2 md:pl-3 pr-2 md:pr-4 py-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              {user?.name ? (
                <span className="text-white font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="h-5 w-5 text-white" />
              )}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-sm font-semibold text-gray-900">
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-gray-500">Athlete</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
