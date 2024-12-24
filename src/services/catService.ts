import { CatsResponse } from '@/interfaces/Cat';
import { STORAGE_KEYS } from '@/constants/storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchUserCats = async (username: string): Promise<CatsResponse> => {
    console.log('Fetching cats for: ', username);
    const response = await fetch(`${API_URL}/api/cats/${username}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch cats');
    }

    return response.json();
}; 