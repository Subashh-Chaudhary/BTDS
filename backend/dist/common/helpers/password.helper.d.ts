export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePasswords: (plainPassword: string, hashedPassword: string) => Promise<boolean>;
