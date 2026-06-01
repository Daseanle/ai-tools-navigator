"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, CreditCard, Smartphone, Building, QrCode, CheckCircle } from "lucide-react"
import { paymentMethods, type PaymentOrder } from "@/lib/payment"
import { formatPrice } from "@/lib/payment"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  orderData: {
    productName: string
    amount: number
    currency: string
    productType: string
    productId: string
    userId: string
    metadata?: any
  }
  onPaymentSuccess: (order: PaymentOrder) => void
}

export default function PaymentModal({ isOpen, onClose, orderData, onPaymentSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState('')
  const [paymentStep, setPaymentStep] = useState<'select' | 'pay' | 'success'>('select')
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [paymentUrl, setPaymentUrl] = useState('')
  const [order, setOrder] = useState<PaymentOrder | null>(null)

  const availableMethods = paymentMethods.filter(method => method.enabled)

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
  }

  const handlePayment = async () => {
    if (!selectedMethod) return

    setLoading(true)
    try {
      // 创建支付订单
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          paymentMethod: selectedMethod
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setOrder(result.order)
        
        // 根据支付方式显示不同的支付界面
        if (result.payment.qrCode) {
          setQrCode(result.payment.qrCode)
        }
        if (result.payment.paymentUrl) {
          setPaymentUrl(result.payment.paymentUrl)
        }
        
        setPaymentStep('pay')
        
        // 开始轮询支付状态
        startPaymentPolling(result.order.id)
      } else {
        alert(result.error || '支付创建失败')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('支付失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  const startPaymentPolling = (orderId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/query-order?orderId=${orderId}`)
        const result = await response.json()
        
        if (result.success && result.order.status === 'completed') {
          clearInterval(pollInterval)
          setPaymentStep('success')
          onPaymentSuccess(result.order)
        } else if (result.order.status === 'failed') {
          clearInterval(pollInterval)
          alert('支付失败，请重试')
          setPaymentStep('select')
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000)

    // 30秒后停止轮询
    setTimeout(() => clearInterval(pollInterval), 30000)
  }

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'wechat':
        return <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-sm">微</div>
      case 'alipay':
        return <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-sm">支</div>
      case 'card':
        return <CreditCard className="w-6 h-6 text-purple-500" />
      case 'bank_transfer':
        return <Building className="w-6 h-6 text-gray-500" />
      default:
        return <Smartphone className="w-6 h-6 text-gray-500" />
    }
  }

  const renderSelectStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">选择支付方式</h3>
        <p className="text-neutral-400">支付 {formatPrice(orderData.amount)} 购买 {orderData.productName}</p>
      </div>

      <div className="space-y-3">
        {availableMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => handleMethodSelect(method.id)}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-neutral-700 hover:border-neutral-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getMethodIcon(method.type)}
                <div className="text-left">
                  <div className="text-white font-medium">{method.name}</div>
                  <div className="text-neutral-400 text-sm">
                    手续费: {method.fees.percentage}% + ¥{method.fees.fixed}
                  </div>
                </div>
              </div>
              {selectedMethod === method.id && (
                <CheckCircle className="w-5 h-5 text-blue-500" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 border border-neutral-600 text-neutral-300 rounded-xl hover:bg-neutral-800 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handlePayment}
          disabled={!selectedMethod || loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '创建中...' : '立即支付'}
        </button>
      </div>
    </div>
  )

  const renderPayStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">扫码支付</h3>
        <p className="text-neutral-400">
          请使用{availableMethods.find(m => m.id === selectedMethod)?.name}扫描二维码完成支付
        </p>
      </div>

      {qrCode && (
        <div className="flex justify-center">
          <div className="w-48 h-48 bg-white rounded-xl p-4 flex items-center justify-center">
            <QrCode className="w-32 h-32 text-gray-800" />
          </div>
        </div>
      )}

      {paymentUrl && (
        <div className="space-y-3">
          <p className="text-neutral-400 text-sm">或点击下方链接在浏览器中支付</p>
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            在浏览器中支付
          </a>
        </div>
      )}

      <div className="space-y-3">
        <div className="text-sm text-neutral-400">
          订单金额: {formatPrice(orderData.amount)}
        </div>
        <div className="text-sm text-neutral-400">
          订单编号: {order?.id}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onClose}
          className="px-6 py-3 border border-neutral-600 text-neutral-300 rounded-xl hover:bg-neutral-800 transition-colors"
        >
          取消支付
        </button>
      </div>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">支付成功</h3>
        <p className="text-neutral-400">您已成功购买 {orderData.productName}</p>
      </div>

      <div className="space-y-2 text-sm text-neutral-400">
        <div>订单编号: {order?.id}</div>
        <div>支付金额: {formatPrice(orderData.amount)}</div>
        <div>支付时间: {new Date().toLocaleString()}</div>
      </div>

      <button
        onClick={onClose}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
      >
        完成
      </button>
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full mx-4 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {paymentStep === 'select' && renderSelectStep()}
        {paymentStep === 'pay' && renderPayStep()}
        {paymentStep === 'success' && renderSuccessStep()}
      </motion.div>
    </div>
  )
}

// NaviGuard-AI Security Audited - 2026-06-01
