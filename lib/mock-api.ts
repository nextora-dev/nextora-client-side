// Lightweight in-memory mock API for frontend testing without a backend
import { InternalAxiosRequestConfig } from 'axios';
import { AuthResponse } from '../features/auth/auth.types';
import { RoleType } from '../constants/roles';
import { PermissionType } from '../constants/permissions';

// Simple in-memory stores
const users: Record<string, { id: string; email: string; password: string; firstName: string; lastName: string; role: string; authorities: string[] }> = {};
const refreshTokenStore: Record<string, string> = {}; // refreshToken -> email

// Seed a default user for quick testing
const seedUserEmail = 'admin@example.com';
users[seedUserEmail] = {
    id: '1',
    email: seedUserEmail,
    password: 'password',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ROLE_ADMIN',
    authorities: ['user:read', 'user:write'],
};

function base64UrlEncode(obj: unknown) {
    const str = JSON.stringify(obj);
    if (typeof btoa !== 'undefined') {
        return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
    // Node environment
    return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function createToken(email: string, expiresInSec = 3600) {
    const user = users[email];
    const payload = {
        sub: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        authorities: user.authorities,
        exp: Math.floor(Date.now() / 1000) + expiresInSec,
    } as const;

    const header = { alg: 'none', typ: 'JWT' };
    return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.sig`;
}

// Mock API handlers
async function handleLogin(data: unknown) {
    const body = (data as Record<string, unknown>) || {};
    const email = body.email as string | undefined;
    const password = body.password as string | undefined;

    if (!email || !password) {
        throw { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } };
    }

    const user = users[email];
    if (!user || user.password !== password) {
        throw { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } };
    }

    const accessToken = createToken(email);
    const refreshToken = `rt-${Math.random().toString(36).slice(2)}`;
    refreshTokenStore[refreshToken] = email;

    const response: AuthResponse = {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role as unknown as RoleType,
            authorities: user.authorities as unknown as PermissionType[],
            verified: true,
        },
    };

    return response;
}

async function handleRefresh(data: unknown) {
    const body = (data as Record<string, unknown>) || {};
    const refreshToken = body.refreshToken as string | undefined;
    if (!refreshToken) throw { success: false, error: { code: 'INVALID_REFRESH', message: 'Refresh token invalid' } };

    const email = refreshTokenStore[refreshToken];
    if (!email) {
        throw { success: false, error: { code: 'INVALID_REFRESH', message: 'Refresh token invalid' } };
    }

    const accessToken = createToken(email, 3600);
    const newRefresh = `rt-${Math.random().toString(36).slice(2)}`;
    delete refreshTokenStore[refreshToken];
    refreshTokenStore[newRefresh] = email;
    return { accessToken, refreshToken: newRefresh };
}

async function handleMe(headers: Record<string, unknown> | undefined) {
    const auth = (headers && (headers.Authorization || headers.authorization)) || '';
    const token = String(auth).replace('Bearer ', '');
    if (!token) throw { success: false, error: { code: 'UNAUTHORIZED', message: 'No token provided' } };

    const parts = token.split('.');
    if (parts.length < 2) throw { success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid token' } };
    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payloadStr = typeof atob !== 'undefined' ? atob(payloadB64) : Buffer.from(payloadB64, 'base64').toString();
    const payload = JSON.parse(payloadStr) as Record<string, unknown>;

    const email = payload.email as string | undefined;
    const user = email ? users[email] : undefined;
    if (!user) throw { success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } };

    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as unknown as RoleType,
        authorities: user.authorities as unknown as PermissionType[],
        verified: true,
    };
}

async function handleRegister(data: unknown) {
    const body = (data as Record<string, unknown>) || {};
    const email = body.email as string | undefined;
    const password = body.password as string | undefined;
    const firstName = body.firstName as string | undefined;
    const lastName = body.lastName as string | undefined;
    if (!email || !password) throw { success: false, error: { code: 'INVALID_PAYLOAD', message: 'Email and password required' } };
    if (users[email]) throw { success: false, error: { code: 'USER_EXISTS', message: 'User already exists' } };
    const id = `${Date.now()}`;
    users[email] = { id, email, password, firstName: firstName || 'First', lastName: lastName || 'Last', role: 'ROLE_USER', authorities: [] };
    return { message: 'Registered', userId: id };
}

async function handleLogout(_data: unknown, headers: Record<string, unknown> | undefined) {
    const auth = (headers && (headers.Authorization || headers.authorization)) || '';
    const token = String(auth).replace('Bearer ', '');
    if (token) {
        const parts = token.split('.');
        if (parts.length >= 2) {
            const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const payloadStr = typeof atob !== 'undefined' ? atob(payloadB64) : Buffer.from(payloadB64, 'base64').toString();
            const payload = JSON.parse(payloadStr) as Record<string, unknown>;
            const email = payload.email as string | undefined;
            Object.keys(refreshTokenStore).forEach(rt => {
                if (refreshTokenStore[rt] === email) delete refreshTokenStore[rt];
            });
        }
    }
    return { message: 'Logged out' };
}

// Generic router
export const api = {
    get: async <T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> => {
        if (url === '/auth/me') {
            const res = await handleMe(config?.headers as Record<string, unknown> | undefined);
            return res as unknown as T;
        }
        // default empty
        return {} as unknown as T;
    },

    post: async <T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<T> => {
        switch (url) {
            case '/auth/login':
                return (await handleLogin(data)) as unknown as T;
            case '/auth/refresh':
                return (await handleRefresh(data)) as unknown as T;
            case '/auth/register':
                return (await handleRegister(data)) as unknown as T;
            case '/auth/logout':
                return (await handleLogout(data, config?.headers as Record<string, unknown> | undefined)) as unknown as T;
            case '/auth/forgot-password':
            case '/v1/auth/forgot-password':
                return ({ message: 'If an account exists, you will receive a reset email.', success: true } as unknown) as T;
            case '/auth/reset-password':
            case '/v1/auth/reset-password':
                return ({ message: 'Password has been reset successfully.', success: true } as unknown) as T;
            case '/v1/auth/reset-password/validate':
                return ({ valid: true, message: 'Token is valid.' } as unknown) as T;
            case '/auth/send-otp':
            case '/v1/auth/send-otp':
                return ({ message: 'OTP has been sent to your email.', success: true } as unknown) as T;
            case '/auth/verify-otp':
            case '/v1/auth/verify-otp': {
                // Mock OTP verification - accept any 6-digit OTP for testing
                const otpData = data as { otp?: string } | undefined;
                const otp = otpData?.otp || '';
                const isValid = otp.length === 6 && /^\d+$/.test(otp);
                return ({
                    verified: isValid,
                    token: isValid ? 'mock-reset-token-' + Date.now() : '',
                    message: isValid ? 'OTP verified successfully.' : 'Invalid OTP. Please try again.',
                } as unknown) as T;
            }
            case '/auth/resend-otp':
            case '/v1/auth/resend-otp':
                return ({ message: 'OTP has been resent to your email.', success: true } as unknown) as T;
            case '/auth/verify-email':
            case '/v1/auth/verify-email':
            case '/auth/resend-verification':
            case '/v1/auth/resend-verification':
                return ({ message: 'OK' } as unknown) as T;
            default:
                return ({} as unknown) as T;
        }
    },

    put: async <T>(_url: string, _data?: unknown, _config?: InternalAxiosRequestConfig): Promise<T> => {
        return ({} as unknown) as T;
    },

    patch: async <T>(_url: string, _data?: unknown, _config?: InternalAxiosRequestConfig): Promise<T> => {
        return ({} as unknown) as T;
    },

    delete: async <T>(_url: string, _config?: InternalAxiosRequestConfig): Promise<T> => {
        return ({} as unknown) as T;
    },
};

export default api;

