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
    profile: FreelancerProfile | null
    loading: boolean
}

export function VerificationModal({ isOpen, onClose, onVerify, profile, loading }: VerificationModalProps) {
    if (!profile) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Verify Freelancer</DialogTitle>
                    <DialogDescription>
                        Review the submitted NIC/ID document for verification.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                        <span className="font-medium">Freelancer Name</span>
                        <span>{profile.title} (User)</span> {/* We might need to fetch User name separately or store it */}
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">NIC Document</h4>
                        {profile.nicUrl ? (
                            <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-black/5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={profile.nicUrl}
                                    alt="NIC Document"
                                    className="object-contain w-full h-full"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-32 border border-dashed rounded-lg text-muted-foreground">
                                <ShieldAlert className="mr-2 h-4 w-4" /> No Document Uploaded
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="sm:justify-between">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="destructive" onClick={onClose}>
                            <X className="mr-2 h-4 w-4" /> Reject
                        </Button>
                        <Button onClick={onVerify} disabled={loading || !profile.nicUrl}>
                            <Check className="mr-2 h-4 w-4" /> Verify Account
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
