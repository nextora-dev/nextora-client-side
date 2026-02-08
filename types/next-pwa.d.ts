/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Type declarations for next-pwa
 *
 * next-pwa doesn't ship with TypeScript types,
 * so we declare the module here.
 */

declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface RuntimeCacheRule {
    urlPattern: RegExp | ((context: { url: URL; request: Request }) => boolean);
    handler: "CacheFirst" | "CacheOnly" | "NetworkFirst" | "NetworkOnly" | "StaleWhileRevalidate";
    options?: {
      cacheName?: string;
      expiration?: {
        maxEntries?: number;
        maxAgeSeconds?: number;
        purgeOnQuotaError?: boolean;
      };
      cacheableResponse?: {
        statuses?: number[];
        headers?: Record<string, string>;
      };
      networkTimeoutSeconds?: number;
      backgroundSync?: {
        name: string;
        options?: {
          maxRetentionTime?: number;
        };
      };
      fetchOptions?: RequestInit;
      matchOptions?: CacheQueryOptions;
      plugins?: any[];
    };
  }

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    scope?: string;
    sw?: string;
    disableDevLogs?: boolean;
    publicExcludes?: string[];
    buildExcludes?: (string | RegExp)[];
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
    fallbacks?: {
      document?: string;
      image?: string;
      audio?: string;
      video?: string;
      font?: string;
    };
    cacheStartUrl?: boolean;
    dynamicStartUrl?: boolean;
    dynamicStartUrlRedirect?: string;
    runtimeCaching?: RuntimeCacheRule[];
    customWorkerDir?: string;
    customWorkerSrc?: string;
    customWorkerDest?: string;
    customWorkerPrefix?: string;
  }

  function withPWAInit(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;

  export = withPWAInit;
  export default withPWAInit;
}

