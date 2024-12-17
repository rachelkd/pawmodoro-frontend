'use client';

import { UserProfile } from '@/components/profile/UserProfile';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface HeaderProps {
    readonly showUserProfile?: boolean;
    readonly isPlaying?: boolean;
}

export function Header({
    showUserProfile = true,
    isPlaying = false,
}: HeaderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header
            className={`p-6 flex justify-between items-center ${
                mounted ? 'transition-all duration-300' : ''
            } ${
                mounted && isPlaying
                    ? 'opacity-0 hover:opacity-100'
                    : 'opacity-100'
            }`}
        >
            <Link
                href='/'
                className='flex items-center gap-2 hover:opacity-90 transition-opacity'
            >
                <Image
                    src='/cats/cat-2.png'
                    alt='Pawmodoro cat logo'
                    width={64}
                    height={64}
                    className='object-contain'
                />
                <h1 className='text-white/90 text-2xl font-medium'>
                    pawmodoro
                </h1>
            </Link>
            {showUserProfile && <UserProfile />}
        </header>
    );
}
