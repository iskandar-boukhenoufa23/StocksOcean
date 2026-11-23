'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

interface NotificationProps {
  message: string
  type?: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function Notification({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 5000,
}: NotificationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const colors = {
    success: {
      bg: 'bg-green-50 ',
      border: 'border-green-200 ',
      text: 'text-green-800 ',
      icon: 'text-green-600 ',
    },
    error: {
      bg: 'bg-red-50 ',
      border: 'border-red-200 ',
      text: 'text-red-800 ',
      icon: 'text-red-600 ',
    },
    info: {
      bg: 'bg-blue-50 ',
      border: 'border-blue-200 ',
      text: 'text-blue-800 ',
      icon: 'text-blue-600 ',
    },
  }

  const color = colors[type]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-4 left-1/2 z-50 max-w-md w-full mx-4"
        >
          <div
            className={`${color.bg} ${color.border} border-2 rounded-xl p-4 shadow-lg flex items-start gap-3`}
          >
            <div className={`${color.icon} flex-shrink-0 mt-0.5`}>
              {type === 'success' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {type === 'error' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              {type === 'info' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <p className={`${color.text} flex-1 text-sm font-medium`}>{message}</p>
            <button
              onClick={onClose}
              className={`${color.text} hover:opacity-70 transition-opacity flex-shrink-0`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

