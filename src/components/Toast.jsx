import React from 'react'
import { useToast } from '../context/ToastContext'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const TOAST_COLORS = {
  success: 'bg-green-500/20 text-green-300 border-green-500/30',
  error: 'bg-red-500/20 text-red-300 border-red-500/30',
  info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
}

export default function Toast() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => {
        const Icon = TOAST_ICONS[toast.type] || TOAST_ICONS.info
        const colorClass = TOAST_COLORS[toast.type] || TOAST_COLORS.info

        return (
          <div
            key={toast.id}
            className={`glass-card border ${colorClass} p-4 rounded-lg max-w-sm flex items-start space-x-3 animate-in fade-in slide-in-from-right-4 duration-300`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 hover:opacity-70 transition-smooth"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
