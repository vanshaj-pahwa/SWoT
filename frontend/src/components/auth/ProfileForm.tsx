'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { User, Settings } from 'lucide-react'

const profileSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
    email: z.string().email({ message: 'Please enter a valid email address' }),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function ProfileForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const { user, signOut } = useAuth()

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    })

    // Populate form with current user data
    useEffect(() => {
        if (user) {
            setValue('name', user.name || '')
            setValue('email', user.email)
        }
    }, [user, setValue])

    const onSubmit = async (data: ProfileFormData) => {
        if (!user) return

        setIsLoading(true)
        setError(null)
        setSuccess(false)

        try {
            // Update user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                email: data.email,
                data: {
                    name: data.name,
                }
            })

            if (updateError) {
                setError(updateError.message)
                return
            }

            // Note: User profile is updated via auth.updateUser above
            // The users table will be synced via database triggers or auth hooks

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSignOut = async () => {
        try {
            await signOut()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sign out failed')
        }
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center p-8">
                <LoadingSpinner className="h-8 w-8" />
            </div>
        )
    }

    return (
        <div className="w-full max-w-md space-y-6">
            <div className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                    {user.profileImageUrl ? (
                        <img
                            src={user.profileImageUrl}
                            alt="Profile"
                            className="h-20 w-20 rounded-full object-cover"
                        />
                    ) : (
                        <User className="h-10 w-10 text-gray-400" />
                    )}
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Profile Settings
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Manage your account information and preferences.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}

                {success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="text-sm text-green-700">Profile updated successfully!</div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        type="text"
                        {...register('name')}
                        className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600">{errors.name.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                        <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Changing your email will require verification.
                    </p>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || isLoading || !isDirty}
                >
                    {isLoading ? (
                        <>
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <Settings className="mr-2 h-4 w-4" />
                            Update Profile
                        </>
                    )}
                </Button>
            </form>

            <div className="pt-6 border-t border-gray-200">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSignOut}
                >
                    Sign Out
                </Button>
            </div>
        </div>
    )
}