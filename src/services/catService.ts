import { CatsResponse } from '@/interfaces/Cat';
import { STORAGE_KEYS } from '@/constants/storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Interface for the create cat request body
 */
interface CreateCatRequest {
    name: string;
    imageFileName?: string;
}

/**
 * Interface for the create cat response
 */
interface CreateCatResponse {
    catName: string;
    ownerUsername: string;
    imageFileName: string | null;
}

/**
 * Fetches all cats for a given user
 * @param username - The username of the cat owner
 * @returns Promise containing the cats response
 * @throws Error if the fetch request fails
 */
export const fetchUserCats = async (username: string): Promise<CatsResponse> => {
    console.log('Fetching cats for:', username);
    const response = await fetch(`${API_URL}/api/cats/${username}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)}`,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to fetch cats: ${error.message}`);
    }

    return response.json();
};

/**
 * Creates a new cat for a user
 * @param username - The username of the cat owner
 * @param catData - The cat data containing name and optional image file name
 * @returns Promise containing the created cat response
 * @throws Error if the cat creation fails or validation fails
 */
export const createCat = async (username: string, catData: CreateCatRequest): Promise<CreateCatResponse> => {
    // Validate cat name (letters only, 1-20 chars)
    if (!/^[a-zA-Z]{1,20}$/.exec(catData.name)) {
        throw new Error('Cat name must be 1-20 letters only');
    }

    // Validate image file name if provided
    if (catData.imageFileName && !/^cat-[1-5]\.png$/.exec(catData.imageFileName)) {
        throw new Error('Image file name must match pattern "cat-[1-5].png"');
    }

    const response = await fetch(`${API_URL}/api/cats/${username}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(catData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create cat');
    }

    return response.json();
};

/**
 * Deletes a cat for a user
 * @param username - The username of the cat owner
 * @param catName - The name of the cat to delete
 * @throws Error if the deletion fails
 */
export const deleteCat = async (username: string, catName: string): Promise<void> => {
    console.log('Deleting cat', catName, 'for user', username);
    const response = await fetch(`${API_URL}/api/cats/${username}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: catName }),
    });

    if (!response.ok) {
        throw new Error('Failed to delete cat');
    }
}; 