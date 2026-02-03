"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { User } from "@/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, User as UserIcon } from "lucide-react"
import { format } from "date-fns"
import { formatSafeDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchUsers() {
            try {
                const q = query(collection(db, "users"))
                const querySnapshot = await getDocs(q)
                const fetchedUsers = querySnapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                })) as User[]
                // Sort client-side to avoid missing index error in production
                fetchedUsers.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
                setUsers(fetchedUsers)
            } catch (error) {
                console.error("Error fetching users:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">User Management</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Monitor and manage platform users.</p>
                </div>
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.uid}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <UserIcon className="h-4 w-4 text-primary" />
                                    </div>
                                    {user.name}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? "destructive" : "secondary"} className="capitalize">
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {formatSafeDate(user.createdAt)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
