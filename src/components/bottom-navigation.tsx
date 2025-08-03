'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Calculator, Moon, BarChart3, Bell, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  isActive?: boolean
}

export function BottomNavigation() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      label: 'Calculate',
      href: '/',
      icon: Calculator,
      isActive: pathname === '/',
    },
    {
      label: 'Energy',
      href: '/energy',
      icon: Zap,
      isActive: pathname === '/energy',
    },
    {
      label: 'Tracking',
      href: '/tracking',
      icon: Moon,
      isActive: pathname === '/tracking',
    },
    {
      label: 'History',
      href: '/history',
      icon: BarChart3,
      isActive: pathname === '/history',
    },
    {
      label: 'Alarms',
      href: '/alarms',
      icon: Bell,
      isActive: pathname === '/alarms',
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-white/20 safe-area-pb">
      <div className="grid grid-cols-5 h-16">
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 transition-colors relative',
                item.isActive
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {item.isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-purple-600 dark:bg-purple-400 rounded-b-full" />
              )}
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
