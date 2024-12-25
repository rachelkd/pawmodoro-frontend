'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogIn, LogOut } from 'lucide-react';

export function UserProfile() {
    const { user, logout, isLoading } = useAuth();

    if (isLoading) return null;

    if (!user) {
        return (
            <Link href='/login'>
                <Button
                    variant='outline'
                    size='icon'
                    className='group relative sm:hover:w-[5.5rem] sm:hover:px-4 smhover:size-default transition-[width,padding] duration-200 overflow-hidden'
                >
                    <div className='absolute inset-0 flex items-center justify-center group-hover:justify-start group-hover:pl-3 transition-all duration-200'>
                        <LogIn />
                    </div>
                    <span className='invisible group-hover:visible ml-6'>
                        Log in
                    </span>
                </Button>
            </Link>
        );
    }

    return (
        <div className='flex items-center gap-4 text-white'>
            <div>
                <h1 className='text-nowrap hidden sm:block text-xl font-medium'>
                    welcome, {user.username}!
                </h1>
            </div>
            <Button
                variant='outline'
                size='icon'
                className='group relative sm:hover:w-[6rem] sm:hover:px-4 sm:hover:size-default transition-[width,padding] duration-200 overflow-hidden'
                onClick={logout}
            >
                <div className='absolute inset-0 flex items-center justify-center group-hover:justify-start group-hover:pl-3 transition-all duration-200'>
                    <LogOut />
                </div>
                <span className='invisible group-hover:visible ml-6'>
                    Sign out
                </span>
            </Button>
        </div>
    );
}
