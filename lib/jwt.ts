// JWT Utility Functions
import { JWTPayload, DecodedToken } from '../types/jwt';

/**
 * Decode a JWT token without verification (client-side)
 * Note: Server-side verification should be done by Spring Boot
 */
export function decodeToken(token: string): JWTPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payload = parts[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decoded as JWTPayload;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
        return true;
    }

    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
}

/**
 * Get time until token expiration in milliseconds
 */
export function getTokenExpiresIn(token: string): number {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
        return 0;
    }

    const expiresIn = decoded.exp * 1000 - Date.now();
    return Math.max(0, expiresIn);
}

/**
 * Decode token with additional metadata
 */
export function getDecodedToken(token: string): DecodedToken | null {
    const decoded = decodeToken(token);
    if (!decoded) {
        return null;
    }

    return {
        ...decoded,
        isExpired: isTokenExpired(token),
        expiresIn: getTokenExpiresIn(token),
    };
}

/**
 * Extract user info from token
 */
export function getUserFromToken(token: string) {
    const decoded = decodeToken(token);
    if (!decoded) {
        return null;
    }

    // Handle fullName from token - split into firstName and lastName
    const fullName = decoded.fullName?.trim() || '';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    return {
        id: decoded.sub || String(decoded.userId || ''),
        email: decoded.sub, // sub contains the email in this JWT structure
        firstName,
        lastName,
        role: decoded.role,
        authorities: decoded.authorities || [],
    };
}

/**
 * Check if token has specific authority/permission
 */
export function hasAuthority(token: string, authority: string): boolean {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.authorities) {
        return false;
    }

    return decoded.authorities.includes(authority);
}

/**
 * Check if token has any of the specified authorities
 */
export function hasAnyAuthority(token: string, authorities: string[]): boolean {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.authorities) {
        return false;
    }

    return authorities.some(auth => decoded.authorities.includes(auth));
}

/**
 * Check if token has all of the specified authorities
 */
export function hasAllAuthorities(token: string, authorities: string[]): boolean {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.authorities) {
        return false;
    }

    return authorities.every(auth => decoded.authorities.includes(auth));
}

/**
 * Check if token should be refreshed (within 5 minutes of expiry)
 */
export function shouldRefreshToken(token: string, thresholdMs: number = 5 * 60 * 1000): boolean {
    const expiresIn = getTokenExpiresIn(token);
    return expiresIn > 0 && expiresIn < thresholdMs;
}
