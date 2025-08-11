'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import AuthButton from './AuthButton'
import { Search, Zap } from 'lucide-react'

export default function Header() {
  const { user } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Squarium</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Problems
            </Link>
            {user && (
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
            )}
            <a 
              href="https://producthunt.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Product Hunt
            </a>
          </nav>

          <AuthButton />
        </div>
      </div>
    </header>
  )
}