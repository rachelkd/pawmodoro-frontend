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

export function SignupForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();

    const validateForm = () => {
        // Username validation
        if (!/^[a-zA-Z0-9_-]*$/.test(formData.username)) {
            setError(
                'Username can only contain letters, numbers, underscores and hyphens'
            );
            return false;
        }
        if (formData.username.length < 3 || formData.username.length > 50) {
            setError('Username must be between 3 and 50 characters');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        // Password validation
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }

        // Password confirmation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!validateForm()) {
            setIsLoading(false);
            return;
        }

        try {
            await signup(
                formData.username,
                formData.email,
                formData.password,
                formData.confirmPassword
            );
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Card className='w-[350px]'>
            <CardHeader>
                <CardTitle className='text-2xl font-bold text-center text-gunmetal'>
                    Create an account
                </CardTitle>
                <CardDescription className='text-center text-sm'>
                    Sign up for your Pawmodoro account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='space-y-2'>
                        <Input
                            type='text'
                            name='username'
                            placeholder='Username'
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className='space-y-2'>
                        <Input
                            type='email'
                            name='email'
                            placeholder='Email'
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className='space-y-2'>
                        <Input
                            type='password'
                            name='password'
                            placeholder='Password'
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className='space-y-2'>
                        <Input
                            type='password'
                            name='confirmPassword'
                            placeholder='Confirm Password'
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
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
                                <Loader2 className='animate-spin' />
                                Creating account...
                            </>
                        ) : (
                            'Sign Up'
                        )}
                    </Button>
                    <div className='text-center text-sm'>
                        Already have an account?{' '}
                        <Link
                            href='/login'
                            className='underline underline-offset-4'
                        >
                            Log in
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
