# Git file selection

The first commit includes the application source, Prisma schema and seed, configuration, lockfile, documentation, and the sample paper fixture. `lib/logger.ts` is source code and remains included. Future `src/lib/` and `src/server/` source files are also included by the current rules.

`.gitignore` excludes installed dependencies, Next.js output, generated Prisma client files, coverage output, TypeScript build information, logs, temporary files, and local environment files. These files can be recreated or contain machine-specific data. Excluding them keeps commits and clones smaller. `.env.example` is the only environment file intentionally included; its database URL uses placeholder credentials.

## Verification

Before staging, `git add -n .` listed the project source and `.env.example` without `.env`, `.next/`, `node_modules/`, or `lib/generated/`. `git check-ignore` confirmed that `.env`, `.env.test`, `.env.staging`, `.env.production.local`, `coverage/index.html`, and `tsconfig.tsbuildinfo` are excluded. It also confirmed that `.env.example`, `lib/logger.ts`, the sample fixture, and paths under `src/lib/` and `src/server/` are eligible for Git.

To recheck after future changes, run `git status --short --ignored` and `git add -n .` before staging.
