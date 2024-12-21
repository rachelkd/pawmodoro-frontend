import { Cat } from '@/interfaces/Cat';
import Image from 'next/image';

interface CatCardProps {
    cat: Cat;
    direction: 'left' | 'right';
    onClick: () => void;
}

export const CatCard = ({ cat, direction, onClick }: CatCardProps) => {
    return (
        <button
            className='cursor-pointer transition-transform hover:scale-110 bg-transparent border-0 p-0'
            onClick={onClick}
        >
            <Image
                src={`/cats/${cat.imageFileName}`}
                alt={cat.name}
                width={100}
                height={100}
                className={`${
                    direction === 'left' ? 'scale-x-[-1]' : ''
                } select-none`}
                unoptimized
                draggable={false}
                priority
            />
        </button>
    );
};
