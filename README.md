# Next Contract

Type-safe contracts for seamless communication between client components, server components, API routes, and backend services in Next.js.

## Architecture

Each contract is split into three parts:

- **Shared** — Common input/output types, validation, result shapes, and error handling.
- **Server** — Executes backend operations and exposes them to Server Components and API routes.
- **Client** — Handles API requests and provides utilities for TanStack Query.

Backend operations can import shared contracts directly, avoiding circular dependencies.

## Development

```bash
yarn build
yarn test
yarn test:types
yarn check
```

## Status

Under active development. Public APIs are not finalized yet.

## License

MIT
