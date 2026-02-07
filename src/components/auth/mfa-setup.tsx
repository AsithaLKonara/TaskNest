"use client"

import { useState } from "react"
import { auth } from "@/lib/firebase"
import {
    multiFactor,
    PhoneAuthProvider,
    PhoneMultiFactorGenerator,
    RecaptchaVerifier
} from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, ShieldCheck, Smartphone } from "lucide-react"

export function MFASetup() {
    const [phoneNumber, setPhoneNumber] = useState("")
    const [verificationCode, setVerificationCode] = useState("")
    const [verificationId, setVerificationId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'phone' | 'code'>('phone')

    const user = auth.currentUser

    // Initial check for existing MFA
    const isMfaEnabled = user && multiFactor(user).enrolledFactors.length > 0

    async function setupRecaptcha() {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible'
            })
        }
    }

    async function handleSendCode() {
        if (!user || !phoneNumber) return
        setLoading(true)
        try {
            await setupRecaptcha()
            const session = await multiFactor(user).getSession()
            const phoneInfoOptions = {
                phoneNumber,
                session
            }
            const phoneAuthProvider = new PhoneAuthProvider(auth)
            const vId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, (window as any).recaptchaVerifier)
            setVerificationId(vId)
            setStep('code')
            toast.success("Verification code sent to your phone.")
        } catch (error: any) {
            console.error("MFA Error:", error)
            toast.error(error.message || "Failed to send verification code")
            if ((window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier.clear()
                delete (window as any).recaptchaVerifier
            }
        } finally {
            setLoading(false)
        }
    }

    async function handleVerifyCode() {
        if (!user || !verificationId || !verificationCode) return
        setLoading(true)
        try {
            const cred = PhoneAuthProvider.credential(verificationId, verificationCode)
            const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred)
            await multiFactor(user).enroll(multiFactorAssertion, "Primary Phone")
            toast.success("MFA successfully enabled!")
            setStep('phone')
            setVerificationId(null)
            setVerificationCode("")
        } catch (error: any) {
            toast.error(error.message || "Invalid verification code")
        } finally {
            setLoading(false)
        }
    }

    if (isMfaEnabled) {
        return (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-green-600 h-6 w-6" />
                    <div>
                        <p className="font-semibold text-green-900">Multi-Factor Authentication is Enabled</p>
                        <p className="text-sm text-green-700">Your account is protected with an extra layer of security.</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info("Contact support to disable MFA for now.")}>
                    Manage
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4 pt-4 border-t">
            <div id="recaptcha-container"></div>

            <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">SMS Two-Factor Authentication</h3>
            </div>

            <p className="text-sm text-muted-foreground">
                Enhance your account security by requiring a code sent to your mobile phone during login.
            </p>

            {step === 'phone' ? (
                <div className="flex gap-2 max-w-sm">
                    <div className="flex-1">
                        <Label htmlFor="phone" className="sr-only">Phone Number</Label>
                        <Input
                            id="phone"
                            placeholder="+94 7X XXX XXXX"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleSendCode} disabled={loading || !phoneNumber}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enable
                    </Button>
                </div>
            ) : (
                <div className="flex gap-2 max-w-sm">
                    <div className="flex-1">
                        <Label htmlFor="code" className="sr-only">Verification Code</Label>
                        <Input
                            id="code"
                            placeholder="Enter 6-digit code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleVerifyCode} disabled={loading || !verificationCode}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Verify
                    </Button>
                    <Button variant="ghost" onClick={() => setStep('phone')} disabled={loading}>
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    )
}
