// Token Service - JWT utilities
import { JWTPayload, DecodedToken } from '@/types';

export function decodeToken(token: string): JWTPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return decoded as JWTPayload;
    } catch {
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
}

export function getTokenExpiresIn(token: string): number {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return 0;
    return Math.max(0, decoded.exp * 1000 - Date.now());
}

export function getDecodedToken(token: string): DecodedToken | null {
    const decoded = decodeToken(token);
    if (!decoded) return null;
    return { ...decoded, isExpired: isTokenExpired(token), expiresIn: getTokenExpiresIn(token) };
}

export function shouldRefreshToken(token: string, thresholdMs: number = 5 * 60 * 1000): boolean {
    const expiresIn = getTokenExpiresIn(token);
    return expiresIn > 0 && expiresIn < thresholdMs;
}
