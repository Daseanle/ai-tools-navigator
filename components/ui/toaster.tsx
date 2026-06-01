"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, onClose, duration, ...props }) {
        return (
          <Toast 
            key={id} 
            id={id}
            title={title}
            description={description}
            variant={variant} 
            onClose={onClose}
            duration={duration}
            {...props}
          />
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
