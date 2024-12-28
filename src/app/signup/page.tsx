import { SignupForm } from '@/components/auth/signup-form';
import { Header } from '@/components/timer/Header';

export default function SignupPage() {
    return (
        <div className='min-h-screen flex flex-col'>
            <Header showUserProfile={false} />
            <div className='flex-1 flex items-center justify-center'>
                <SignupForm />
            </div>
        </div>
    );
}
