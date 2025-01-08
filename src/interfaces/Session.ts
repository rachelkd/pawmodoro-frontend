export interface Session {
    id: string;
    sessionType: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
    durationMinutes: number;
    startTime: string;
    endTime: string;
    wasCompleted: boolean;
    interruptionCount: number;
}

export interface CreateSessionRequest {
    sessionType: Session['sessionType'];
    durationMinutes: number;
}
