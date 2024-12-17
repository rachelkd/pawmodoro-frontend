export interface Cat {
    name: string;
    ownerUsername: string;
    happinessLevel: number;
    hungerLevel: number;
    imageFileName: string;
}

export interface CatsResponse {
    success: boolean;
    cats: Cat[];
    message: string;
} 