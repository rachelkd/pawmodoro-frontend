'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function UserProfile() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // Don't render anything while loading to prevent hydration mismatch
    if (isLoading) {
        return null;
    }

    if (!user) {
        return (
            <div className='flex items-center gap-4 p-4'>
                <Link href='/login'>
                    <Button variant='outline' size='sm' className='text-white'>
                        Log in
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className='flex items-center gap-4 p-4 text-white'>
            <div>
                <p className='text-sm font-medium'>Welcome, {user.username}!</p>
            </div>
            <Button variant='outline' size='sm' onClick={handleLogout}>
                Logout
            </Button>
        </div>
    );
}
