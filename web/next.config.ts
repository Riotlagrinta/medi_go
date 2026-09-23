import type { NextConfig } from 'next';
import fs from 'node:fs';
import { withSentryConfig } from '@sentry/nextjs/config';

// Polyfill pour corriger l'incompatibilité de Node 24 sur Windows avec Webpack (EISDIR au lieu de EINVAL sur readlink)
const origReadlink = fs.readlink;
const origReadlinkSync = fs.readlinkSync;

(fs as any).readlinkSync = function (path: fs.PathLike, options?: any) {
  try {
    return origReadlinkSync.call(fs, path, options);
  } catch (err: any) {
    if (err && (err.code === 'EISDIR' || err.code === 'UNKNOWN')) {
      const einval = new Error(`EINVAL: invalid argument, readlink '${path}'`);
      (einval as any).code = 'EINVAL';
      (einval as any).errno = -4071;
      (einval as any).syscall = 'readlink';
      throw einval;
    }
    throw err;
  }
};

(fs as any).readlink = function (path: fs.PathLike, ...args: any[]) {
  const cb = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;
  const otherArgs = cb ? args.slice(0, -1) : args;
  
  if (!cb) {
    return (origReadlink as any).call(fs, path, ...args);
  }

  return (origReadlink as any).call(fs, path, ...otherArgs, (err: any, linkString: any) => {
    if (err && (err.code === 'EISDIR' || err.code === 'UNKNOWN')) {
      const einval = new Error(`EINVAL: invalid argument, readlink '${path}'`);
      (einval as any).code = 'EINVAL';
      (einval as any).errno = -4071;
      (einval as any).syscall = 'readlink';
      return cb(einval);
    }
    return cb(err, linkString);
  });
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
      },
    ],
  },
};

// withSentryConfig est sûr à appliquer même sans compte Sentry : sans SENTRY_AUTH_TOKEN
// il saute juste l'upload des sourcemaps (avertissement en build, rien de bloquant).
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  webpack: { treeshake: { removeDebugLogging: true } },
});
