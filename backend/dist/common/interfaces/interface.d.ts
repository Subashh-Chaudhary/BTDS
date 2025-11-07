export interface ISocialUser {
    email?: string;
    name?: string;
    auth_provider: string;
    provider_id: string;
}
export interface IGoogleProfile {
    id: string;
    displayName: string;
    name: {
        familyName: string;
        givenName: string;
    };
    emails: Array<{
        value: string;
        verified: boolean;
    }>;
    photos: Array<{
        value: string;
    }>;
}
