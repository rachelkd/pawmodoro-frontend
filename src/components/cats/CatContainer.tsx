import { Cat } from '@/interfaces/Cat';
import { CatCard } from './CatCard';
import { useEffect, useState, useRef, useCallback } from 'react';
import { CatStatsModal } from './CatStatsModal';
import { useCatContext } from '@/contexts/CatContext';

interface Position {
    x: number;
    velocityX: number;
}

export const CatContainer = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [positions, setPositions] = useState<Position[]>([]);
    const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { cats } = useCatContext();
    const CAT_WIDTH = 100;

    const calculateNewPosition = (pos: Position, maxX: number): Position => {
        let newX = pos.x + pos.velocityX;
        let newVelocityX = pos.velocityX;

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
    };

    const updatePositions = useCallback(() => {
        if (!containerRef.current) return;
        const containerWidth = containerRef.current.offsetWidth;
        const maxX = containerWidth - CAT_WIDTH;
        setPositions((prevPositions) =>
            prevPositions.map((pos) => calculateNewPosition(pos, maxX))
        );
    }, []);

    useEffect(() => {
        const initialPositions = cats.map((_, index) => ({
            x: index * CAT_WIDTH,
            velocityX: 1,
        }));
        setPositions(initialPositions);

        const animationInterval = setInterval(updatePositions, 16);
        return () => clearInterval(animationInterval);
    }, [cats, updatePositions]);

    const handleCatClick = (cat: Cat) => {
        setSelectedCat(cat);
        setIsModalOpen(true);
    };

    return (
        <>
            <div
                ref={containerRef}
                className='relative w-full h-[200px] rounded-lg overflow-hidden bg-sage-dark/10'
            >
                {cats.map((cat, index) => (
                    <div
                        key={cat.name}
                        className='absolute top-1/2 -translate-y-1/2'
                        style={{
                            left: `${positions[index]?.x ?? 0}px`,
                        }}
                    >
                        <CatCard
                            cat={cat}
                            direction={
                                positions[index]?.velocityX > 0
                                    ? 'left'
                                    : 'right'
                            }
                            onClick={() => handleCatClick(cat)}
                        />
                    </div>
                ))}
            </div>

            {selectedCat && (
                <CatStatsModal
                    cat={selectedCat}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};
