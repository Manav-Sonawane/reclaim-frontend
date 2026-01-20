'use client';

import { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { User, Bell, Shield, Moon, Sun, Laptop } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';
import api from '../../lib/api';

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            // 1. Upload Image
            const { data: uploadData } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 2. Update Profile with new URL
            const { data: userData } = await api.put('/users/profile', {
                profilePicture: uploadData.url
            });

            // 3. Update Local State
            updateUser(userData);
            toast.success('Avatar updated successfully');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;

        try {
            const { data: userData } = await api.put('/users/profile', {
                name
            });
            updateUser(userData);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update profile');
        }
    };

    if (!user) {
        return <div className="p-8 text-center">Please login to view settings.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-500 mt-2">Manage your account preferences and profile.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Navigation (Visual Only for now) */}
                <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                        <User className="mr-2 h-4 w-4" /> Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <Bell className="mr-2 h-4 w-4" /> Notifications
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <Shield className="mr-2 h-4 w-4" /> Security
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <Moon className="mr-2 h-4 w-4" /> Appearance
                    </Button>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your public profile details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl font-bold overflow-hidden">
                                        {user.profilePicture ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            user.name?.charAt(0) || 'U'
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                        >
                                            {uploading ? 'Uploading...' : 'Change Avatar'}
                                        </Button>
                                    </div>
                                </div>

                                <form onSubmit={handleSave} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Full Name"
                                            defaultValue={user.name}
                                            name="name"
                                        />
                                        <Input
                                            label="Email"
                                            type="email"
                                            defaultValue={user.email}
                                            disabled
                                            className="bg-gray-50 dark:bg-gray-900 text-gray-500"
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button type="submit">Save Changes</Button>
                                    </div>
                                </form>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                            <CardDescription>Manage how you receive updates.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-2">
                                <div>
                                    <p className="font-medium">Email Notifications</p>
                                    <p className="text-sm text-gray-500">Receive emails when your items are claimed or matched.</p>
                                </div>
                                <div className="h-6 w-11 bg-blue-600 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize the look and feel of the application.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <Button
                                    variant={mounted && theme === 'light' ? 'primary' : 'outline'}
                                    className="flex flex-col items-center gap-2 h-auto py-4"
                                    onClick={() => setTheme('light')}
                                >
                                    <Sun className="h-6 w-6" />
                                    <span>Light</span>
                                </Button>
                                <Button
                                    variant={mounted && theme === 'dark' ? 'primary' : 'outline'}
                                    className="flex flex-col items-center gap-2 h-auto py-4"
                                    onClick={() => setTheme('dark')}
                                >
                                    <Moon className="h-6 w-6" />
                                    <span>Dark</span>
                                </Button>
                                <Button
                                    variant={mounted && theme === 'system' ? 'primary' : 'outline'}
                                    className="flex flex-col items-center gap-2 h-auto py-4"
                                    onClick={() => setTheme('system')}
                                >
                                    <Laptop className="h-6 w-6" />
                                    <span>System</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
