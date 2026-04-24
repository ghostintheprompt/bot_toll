# BUILD.md

## Development
```bash
npm install
npm run dev
```

## Production Build
```bash
npm run build
```
The output will be in the `dist/` directory.

## Deployment
1. Copy `dist/` to your server.
2. Copy `server.ts` to the root.
3. Install dependencies: `npm install express dotenv tsx`.
4. Run: `NODE_ENV=production npx tsx server.ts`.

## Release Script
Run `./make_release.sh` to tag and package the project.
