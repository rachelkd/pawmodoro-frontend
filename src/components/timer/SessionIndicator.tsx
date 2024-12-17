interface SessionIndicatorProps {
    readonly currentSession: number;
    readonly totalSessions?: number;
}

export function SessionIndicator({
    currentSession,
    totalSessions = 4,
}: SessionIndicatorProps) {
    return (
        <div className='flex gap-3'>
            {[...Array(totalSessions)].map((_, i) => (
                <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                        i === currentSession ? 'bg-white' : 'bg-white/30'
                    }`}
                />
            ))}
        </div>
    );
}
