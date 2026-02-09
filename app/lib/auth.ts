export interface User {
    username: string;
    ucpName: string;
    characters: string[];
}

export const mockLogin = async (username: string, password: string): Promise<User | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (username && password) {
        return {
            username: username,
            ucpName: username, // Mock UCP name as username for now
            characters: ['Marcus Vance', 'Elena Kostic', 'Deshawn Williams'] // Mock GTAW Characters
        };
    }
    return null;
};
