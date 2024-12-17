import { Cat } from '@/interfaces/Cat';
import Image from 'next/image';

interface CatCardProps {
    cat: Cat;
    direction?: 'left' | 'right';
}

export const CatCard = ({ cat, direction = 'right' }: CatCardProps) => {
    return (
        <div className='relative'>
            <div className={direction === 'left' ? 'scale-x-[-1]' : ''}>
                <Image
                    src={`/cats/${cat.imageFileName}`}
                    alt={cat.name}
                    width={96}
                    height={96}
                    className='object-cover rounded-full select-none'
                    unoptimized
                    draggable={false}
                    priority
                />
            </div>
        </div>
    );
};
