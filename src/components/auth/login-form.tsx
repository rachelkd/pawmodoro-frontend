'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { setUser } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(
                'http://localhost:8080/api/users/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ username, password }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    const firstErrorMessage = Object.values(data)[0];
                    if (typeof firstErrorMessage === 'string') {
                        throw new Error(firstErrorMessage);
                    }
                    throw new Error('Validation failed');
                }
                throw new Error(data.message || 'Login failed');
            }

            if (data.token) {
                const userData = {
                    username: data.username,
                    token: data.token,
                };
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            }

            router.push('/');
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            } else if (!window.navigator.onLine) {
                setError(
                    'Network connection error. Please check your internet connection.'
                );
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        }
    };

    return (
        <Card className='w-[350px]'>
            <CardHeader>
                <CardTitle className='text-2xl font-bold text-center text-gunmetal'>
                    Welcome back
                </CardTitle>
                <CardDescription className='text-center text-sm'>
                    Enter your Pawmodoro account details below.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='space-y-2'>
                        <Input
                            type='text'
                            placeholder='Username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className='space-y-2'>
                        <Input
                            type='password'
                            placeholder='Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className='text-red-500 text-sm'>{error}</p>}
                    <Button type='submit' className='w-full'>
                        Sign In
                    </Button>
                    <div className='text-center text-sm text-gunmetal'>
                        Don&apos;t have an account?{' '}
                        <Link
                            href='/signup'
                            className='underline underline-offset-4'
                        >
                            Sign up
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
