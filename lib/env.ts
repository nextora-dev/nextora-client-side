// Environment Configuration
const getEnvVar = (key: string, defaultValue?: string): string => {
    // Prefer explicit process.env value when present
    const raw = process.env[key];

    // If running in browser and the variable isn't public, don't attempt to warn or read it
    if (typeof window !== 'undefined' && !key.startsWith('NEXT_PUBLIC_')) {
        return raw ?? defaultValue ?? '';
    }

    // Only warn when there is no value and no default provided
    if (raw === undefined && defaultValue === undefined) {
        console.warn(`Environment variable ${key} is not defined`);
    }

    return (raw ?? defaultValue) || '';
};

export const env = {
    // API Configuration
    // Default API URL changed to 8080 to match the BFF proxy and ARCHITECTURE.md default
    // If your backend runs on a different port, set NEXT_PUBLIC_API_URL in .env.local
    API_URL: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:8081/api/v1'),
    API_TIMEOUT: parseInt(getEnvVar('NEXT_PUBLIC_API_TIMEOUT', '10000'), 10),

    // Auth Configuration (only expose public client-safe values here)
    TOKEN_EXPIRY: parseInt(getEnvVar('NEXT_PUBLIC_TOKEN_EXPIRY', '3600'), 10), // seconds
    REFRESH_TOKEN_EXPIRY: parseInt(getEnvVar('NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY', '604800'), 10), // 7 days

    // App Configuration
    APP_NAME: getEnvVar('NEXT_PUBLIC_APP_NAME', 'Nextora LMS'),
    APP_URL: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),

    // Feature Flags
    ENABLE_REGISTRATION: getEnvVar('NEXT_PUBLIC_ENABLE_REGISTRATION', 'true') === 'true',
    ENABLE_OAUTH: getEnvVar('NEXT_PUBLIC_ENABLE_OAUTH', 'false') === 'true',

    // Development
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

export default env;
