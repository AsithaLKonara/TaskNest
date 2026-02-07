"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard } from "lucide-react"
import { toast } from "sonner"

interface PayHereButtonProps {
    orderId: string
    clientId: string
    amount: number
    currency?: string
    buttonText?: string
    className?: string
}

export function PayHereButton({
    orderId,
    clientId,
    amount,
    currency = 'LKR',
    buttonText = 'Pay with PayHere',
    className
}: PayHereButtonProps) {
    const [loading, setLoading] = useState(false)

    async function handlePayment() {
        setLoading(true)
        try {
            const response = await fetch('/api/payments/payhere/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, clientId, amount, currency })
            })

            const data = await response.json()
            if (data.error) throw new Error(data.error)

            // Create a hidden form and submit it to PayHere
            const form = document.createElement('form')
            form.method = 'POST'
            form.action = data.url

            Object.entries(data.params).forEach(([key, value]) => {
                const input = document.createElement('input')
                input.type = 'hidden'
                input.name = key
                input.value = value as string
                form.appendChild(input)
            })

            document.body.appendChild(form)
            form.submit()
        } catch (error: any) {
            console.error('Payment failed:', error)
            toast.error(error.message || 'Payment initialization failed')
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handlePayment}
            disabled={loading}
            className={className}
        >
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <CreditCard className="mr-2 h-4 w-4" />
            )}
            {buttonText}
        </Button>
    )
}
