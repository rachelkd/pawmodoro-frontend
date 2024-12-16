import { Button } from '@/components/ui/button';
import { FaSpotify } from 'react-icons/fa';
import {
    Package,
    SkipBack,
    Play,
    SkipForward,
    LineChart,
    Settings,
} from 'lucide-react';
import { UserProfile } from '@/components/profile/UserProfile';

export default function Home() {
    return (
        <div className='min-h-screen bg-sage flex flex-col'>
            {/* Header */}
            <header className='p-6 flex justify-between items-center'>
                <h1 className='text-white/90 text-xl font-medium'>pawmodoro</h1>
                <UserProfile />
            </header>

            {/* Main Timer */}
            <main className='flex-1 flex flex-col items-center justify-center gap-8'>
                <div className='text-white text-[120px] font-medium tracking-tight'>
                    20:00
                </div>

                {/* Timer Dots */}
                <div className='flex gap-3'>
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                                i === 0 ? 'bg-white' : 'bg-white/30'
                            }`}
                        />
                    ))}
                </div>

                {/* Controls */}
                <div className='flex gap-4'>
                    <Button
                        variant='secondary'
                        size='icon'
                        className='bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12'
                    >
                        <SkipBack className='h-5 w-5' />
                    </Button>
                    <Button
                        variant='secondary'
                        size='icon'
                        className='bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12'
                    >
                        <Play className='h-5 w-5' />
                    </Button>
                    <Button
                        variant='secondary'
                        size='icon'
                        className='bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12'
                    >
                        <SkipForward className='h-5 w-5' />
                    </Button>
                </div>
            </main>

            {/* Footer */}
            <footer className='p-6 flex justify-between'>
                <div className='flex gap-4'>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='text-white/80 hover:bg-white/30 h-14 w-14'
                    >
                        <Settings className='h-8 w-8' />
                    </Button>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='text-white/80 hover:bg-white/30 h-14 w-14'
                    >
                        <FaSpotify className='h-8 w-8' />
                    </Button>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='text-white/80 hover:bg-white/30 h-14 w-14'
                    >
                        <LineChart className='h-8 w-8' />
                    </Button>
                </div>
                <Button
                    variant='ghost'
                    size='icon'
                    className='text-white/80 hover:bg-white/30 h-14 w-14'
                >
                    <Package className='h-8 w-8' />
                </Button>
            </footer>
        </div>
    );
}
