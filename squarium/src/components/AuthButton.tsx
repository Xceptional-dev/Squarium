'use client'

import { useAuth } from '@/hooks/useAuth'
import Button from './ui/Button'
import { LogIn, LogOut, User } from 'lucide-react'

export default function AuthButton() {
  const { user, signIn, signOut, loading } = useAuth()

  if (loading) {
    return (
      <div className="w-20 h-10 bg-gray-200 animate-pulse rounded-md"></div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>{user.email}</span>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={signIn}>
      <LogIn className="h-4 w-4 mr-2" />
      Sign In
    </Button>
  )
}