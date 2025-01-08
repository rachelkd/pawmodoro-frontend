import { Session, CreateSessionRequest } from '@/interfaces/Session';

class SessionService {
    private static instance: SessionService;
    private readonly baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/sessions`;

    private constructor() {}

    public static getInstance(): SessionService {
        if (!SessionService.instance) {
            SessionService.instance = new SessionService();
        }
        return SessionService.instance;
    }

    private getHeaders(accessToken: string): HeadersInit {
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        };
    }

    async createSession(request: CreateSessionRequest, accessToken: string): Promise<Session> {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: this.getHeaders(accessToken),
            body: JSON.stringify(request),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to create session');
        }

        return response.json();
    }

    async completeSession(sessionId: string, accessToken: string): Promise<Session> {
        const response = await fetch(`${this.baseUrl}/${sessionId}/complete`, {
            method: 'PATCH',
            headers: this.getHeaders(accessToken),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to complete session');
        }

        return response.json();
    }

    async cancelSession(sessionId: string, accessToken: string): Promise<Session> {
        const response = await fetch(`${this.baseUrl}/${sessionId}/cancel`, {
            method: 'PATCH',
            headers: this.getHeaders(accessToken),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to cancel session');
        }

        return response.json();
    }

    // For page unload
    cancelSessionSync(sessionId: string, accessToken: string): void {
        const url = new URL(`${this.baseUrl}/${sessionId}/cancel`);
        // Add token to URL parameters
        url.searchParams.append('Authorization', `Bearer ${accessToken}`);
        
        const success = navigator.sendBeacon(url.toString(), new Blob([], { 
            type: 'application/json' 
        }));
        
        if (!success) {
            throw new Error('Failed to send beacon for session cancellation');
        }
    }

    async updateInterruption(sessionId: string, accessToken: string): Promise<Session> {
        const response = await fetch(`${this.baseUrl}/${sessionId}/interruption`, {
            method: 'PATCH',
            headers: this.getHeaders(accessToken),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to update interruption');
        }

        return response.json();
    }
}

export default SessionService;
