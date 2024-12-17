import { Cat } from '@/interfaces/Cat';
import { CatCard } from './CatCard';
import { useEffect, useState, useRef } from 'react';

interface CatContainerProps {
    cats: Cat[];
}

interface Position {
    x: number;
    velocityX: number;
}

export const CatContainer = ({ cats }: CatContainerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [positions, setPositions] = useState<Position[]>([]);
    const CAT_WIDTH = 100; // Width of cat in pixels

    useEffect(() => {
        const initialPositions = cats.map((_, index) => ({
            x: index * CAT_WIDTH,
            velocityX: 1, // Using pixels per frame instead of percentage
        }));
        setPositions(initialPositions);

        const updatePositions = () => {
            if (!containerRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;
            const maxX = containerWidth - CAT_WIDTH;

            setPositions((prevPositions) =>
                prevPositions.map((pos) => {
                    let newX = pos.x + pos.velocityX;
                    let newVelocityX = pos.velocityX;

                    // Bounce off the walls using pixel values
                    if (newX >= maxX) {
                        newX = maxX;
                        newVelocityX = -Math.abs(newVelocityX);
                    } else if (newX <= 0) {
                        newX = 0;
                        newVelocityX = Math.abs(newVelocityX);
                    }

                    return {
                        x: newX,
                        velocityX: newVelocityX,
                    };
                })
            );
        };

        const animationInterval = setInterval(updatePositions, 16);
        return () => clearInterval(animationInterval);
    }, [cats]);

    return (
        <div
            ref={containerRef}
            className='relative w-full h-[200px] rounded-lg overflow-hidden bg-sage-dark/10'
        >
            {cats.map((cat, index) => (
                <div
                    key={cat.name}
                    className='absolute top-1/2 -translate-y-1/2'
                    style={{
                        left: `${positions[index]?.x ?? 0}px`, // Using pixels instead of percentage
                    }}
                >
                    <CatCard
                        cat={cat}
                        direction={
                            positions[index]?.velocityX > 0 ? 'left' : 'right'
                        }
                    />
                </div>
            ))}
        </div>
    );
};
