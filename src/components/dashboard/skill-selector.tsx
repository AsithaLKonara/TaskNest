"use client"

import { useState, KeyboardEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface SkillSelectorProps {
    value: string[]
    onChange: (skills: string[]) => void
    placeholder?: string
}

export function SkillSelector({ value = [], onChange, placeholder = "Type a skill and press Enter" }: SkillSelectorProps) {
    const [inputValue, setInputValue] = useState("")

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            const skill = inputValue.trim()
            if (skill && !value.includes(skill)) {
                onChange([...value, skill])
                setInputValue("")
            }
        } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
            onChange(value.slice(0, -1))
        }
    }

    const removeSkill = (skillToRemove: string) => {
        onChange(value.filter((skill) => skill !== skillToRemove))
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2 mb-2">
                {value.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        {skill}
                        <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 hover:text-destructive focus:outline-none"
                        >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {skill}</span>
                        </button>
                    </Badge>
                ))}
            </div>
            <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full"
            />
            <p className="text-xs text-muted-foreground">
                Press Enter or comma to add a skill.
            </p>
        </div>
    )
}
