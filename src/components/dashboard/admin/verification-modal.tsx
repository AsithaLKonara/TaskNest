"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FreelancerProfile } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Check, X, ShieldAlert } from "lucide-react"

interface VerificationModalProps {
    isOpen: boolean
    onClose: () => void
    onVerify: () => void
    onReject: (reason: string) => void
    profile: FreelancerProfile | null
    loading: boolean
}

export function VerificationModal({ isOpen, onClose, onVerify, onReject, profile, loading }: VerificationModalProps) {
    if (!profile) return null

    const kycDocs = profile.kycDocuments || [];
    const hasDocs = kycDocs.length > 0 || !!profile.nicUrl;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Verify Identity: {profile.name || 'Freelancer'}</DialogTitle>
                    <DialogDescription>
                        Review the submitted ID documents for verification.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg bg-muted/20">
                            <span className="text-xs text-muted-foreground block">Profile Status</span>
                            <Badge variant="outline" className="capitalize">{profile.status}</Badge>
                        </div>
                        <div className="p-3 border rounded-lg bg-muted/20">
                            <span className="text-xs text-muted-foreground block">KYC Status</span>
                            <Badge variant="secondary" className="capitalize">{profile.kycStatus || 'unverified'}</Badge>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            Submitted Documents
                        </h4>

                        {!hasDocs ? (
                            <div className="flex items-center justify-center h-32 border border-dashed rounded-lg text-muted-foreground">
                                <ShieldAlert className="mr-2 h-4 w-4" /> No Documents Uploaded
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {/* Support legacy nicUrl */}
                                {profile.nicUrl && (
                                    <div className="space-y-2">
                                        <span className="text-xs font-medium uppercase text-muted-foreground">ID Card (Legacy)</span>
                                        <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-black/5">
                                            <img src={profile.nicUrl} alt="Legacy NIC" className="object-contain w-full h-full" />
                                        </div>
                                    </div>
                                )}

                                {/* Support new kycDocuments array */}
                                {kycDocs.map((doc, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <span className="text-xs font-medium uppercase text-muted-foreground">{doc.type.replace('_', ' ')}</span>
                                        <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-black/5">
                                            <a href={doc.url} target="_blank" rel="noreferrer">
                                                <img src={doc.url} alt={`KYC Doc ${idx}`} className="object-contain w-full h-full" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="destructive"
                            className="flex-1 sm:flex-none"
                            onClick={() => {
                                const reason = prompt("Enter rejection reason:")
                                if (reason) onReject(reason)
                            }}
                            disabled={loading}
                        >
                            <X className="mr-2 h-4 w-4" /> Reject
                        </Button>
                        <Button
                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                            onClick={onVerify}
                            disabled={loading || !hasDocs}
                        >
                            <Check className="mr-2 h-4 w-4" /> Approve & Verify
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
