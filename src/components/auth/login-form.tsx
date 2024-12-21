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
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(username, password);
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
        } finally {
            setIsLoading(false);
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
                    <Button
                        type='submit'
                        className='w-full'
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Logging in...
                            </>
                        ) : (
                            'Log In'
                        )}
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
