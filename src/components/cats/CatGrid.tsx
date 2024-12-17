import { Cat } from '@/interfaces/Cat';
import { CatCard } from './CatCard';
import { useEffect, useState } from 'react';

interface CatGridProps {
    cats: Cat[];
}

interface Position {
    x: number;
    velocityX: number;
}

export const CatGrid = ({ cats }: CatGridProps) => {
    const [positions, setPositions] = useState<Position[]>([]);

    useEffect(() => {
        const initialPositions = cats.map((_, index) => ({
            x: index * 25,
            velocityX: 0.05,
        }));
        setPositions(initialPositions);

        const updatePositions = () => {
            setPositions((prevPositions) =>
                prevPositions.map((pos) => {
                    let newX = pos.x + pos.velocityX;
                    let newVelocityX = pos.velocityX;

                    // Use container width minus cat width (roughly 10%)
                    if (newX >= 90) {
                        newX = 90;
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
        <div className='relative w-full h-[200px] rounded-lg overflow-hidden'>
            {cats.map((cat, index) => (
                <div
                    key={cat.name}
                    className='absolute top-1/2 -translate-y-1/2'
                    style={{
                        left: `${positions[index]?.x ?? 0}%`,
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
