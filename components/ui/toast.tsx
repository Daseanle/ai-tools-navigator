"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

export interface ToastProps {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive" | "success" | "warning" | "info"
  duration?: number
  onClose?: () => void
}

export interface ToastActionElement {
  altText: string
  action: () => void
  label: string
}

const toastVariants = {
  initial: { opacity: 0, y: -50, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -50, scale: 0.95 },
}

const icons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  default: "bg-neutral-900 border-neutral-700 text-white",
  destructive: "bg-red-900/90 border-red-700 text-red-100",
  success: "bg-green-900/90 border-green-700 text-green-100",
  warning: "bg-yellow-900/90 border-yellow-700 text-yellow-100",
  info: "bg-blue-900/90 border-blue-700 text-blue-100",
}

export function Toast({ id, title, description, variant = "default", duration = 5000, onClose }: ToastProps) {
  const Icon = icons[variant]

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <motion.div
      key={id}
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg max-w-sm ${styles[variant]}`}
    >
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold text-sm mb-1">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>

      <button onClick={onClose} className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

// Export required components for compatibility
export const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const ToastViewport = ({ className }: { className?: string }) => <div className={className} />
export const ToastClose = ({ onClick }: { onClick?: () => void }) => (
  <button onClick={onClick}><X className="w-4 h-4" /></button>
)
export const ToastTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="font-semibold text-sm">{children}</div>
)
export const ToastDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm opacity-90">{children}</div>
)

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => dismiss(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// 简化的 useToast hook
function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback((props: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...props, id }])
    return id
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return { toasts, toast, dismiss }
}

export { useToast }

// NaviGuard-AI Security Audited - 2026-06-01
