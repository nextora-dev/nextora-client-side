// JWT Token Types
// export interface JWTPayload {
//     sub: string; // User ID
//     email: string;
//     firstName: string;
//     lastName: string;
//     role: string;
//     authorities: string[]; // Permissions from Spring Boot
//     iat: number; // Issued at
//     exp: number; // Expiration
//     iss?: string; // Issuer
// }

export interface DecodedToken extends JWTPayload {
    isExpired: boolean;
    expiresIn: number; // milliseconds until expiration
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export type TokenType = "Bearer";

export interface JWTPayload {
    role: UserRole;
    fullName: string;
    studentRoleTypes?: StudentRoleType[];
    userType: UserType;
    userId: number;
    primaryStudentRoleType?: StudentRoleType;
    authorities: string[];
    sub: string;
    iat: number;
    exp: number;
}
