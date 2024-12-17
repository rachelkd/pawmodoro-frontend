import { LoginForm } from '@/components/auth/login-form';
import { Header } from '@/components/timer/Header';

export default function LoginPage() {
    return (
        <div className='min-h-screen flex flex-col'>
            <Header showUserProfile={false} />
            <div className='flex-1 flex items-center justify-center'>
                <LoginForm />
            </div>
        </div>
    );
}
