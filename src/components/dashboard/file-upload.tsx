"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, FileText, X } from "lucide-react"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { toast } from "sonner"
import Image from "next/image"

interface FileUploadProps {
    value?: string[] // Accepts an array of URLs for portfolio, or single URL logic if needed
    onChange: (urls: string[]) => void
    folder?: string
    maxFiles?: number
    accept?: string
    label?: string
}

export function FileUpload({
    value = [],
    onChange,
    folder = "uploads",
    maxFiles = 5,
    accept = "image/*",
    label = "Upload Files"
}: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        if (value.length + files.length > maxFiles) {
            toast.error(`You can only upload up to ${maxFiles} files.`)
            return
        }

        setIsUploading(true)
        const newUrls: string[] = []

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const storageRef = ref(storage, `${folder}/${Date.now()}-${file.name}`)
                const snapshot = await uploadBytes(storageRef, file)
                const url = await getDownloadURL(snapshot.ref)
                newUrls.push(url)
            }
            onChange([...value, ...newUrls])
            toast.success("Upload successful")
        } catch (error) {
            console.error("Upload failed", error)
            toast.error("Upload failed. Please try again.")
        } finally {
            setIsUploading(false)
            if (inputRef.current) inputRef.current.value = "" // Reset
        }
    }

    const removeFile = (urlToRemove: string) => {
        onChange(value.filter(url => url !== urlToRemove))
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                {value.map((url, index) => (
                    <div key={index} className="relative group border rounded-lg overflow-hidden w-24 h-24 bg-muted">
                        {/* Basic check if image by extension or assumption */}
                        {url.includes("token=") ? ( // Firebase URLs usually are usable images
                            <Image
                                src={url}
                                alt="Uploaded"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                <FileText className="h-8 w-8" />
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => removeFile(url)}
                            className="absolute top-1 right-1 bg-black/50 hover:bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}

                {value.length < maxFiles && (
                    <div
                        onClick={() => inputRef.current?.click()}
                        className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                        {isUploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                                <span className="text-[10px] text-muted-foreground">Upload</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={inputRef}
                onChange={handleUpload}
                className="hidden"
                accept={accept}
                multiple
            />
        </div>
    )
}
