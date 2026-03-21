# Publishing the SDK

## Option A: GitHub Packages (no npm 2FA)

1. Create a GitHub Personal Access Token with `write:packages` scope.
2. Configure npm to use it:
   ```bash
   echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc
   ```
   Or for this repo only, create `packages/sdk/.npmrc`:
   ```
   //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
   ```
   Then run: `GITHUB_TOKEN=xxx npm publish`

3. Publish:
   ```bash
   cd packages/sdk
   npm run build
   npm publish
   ```

4. Users install with:
   ```bash
   npm install @panditdhamdhere/agentfoundry-sdk
   ```
   And add to their project's `.npmrc`:
   ```
   @panditdhamdhere:registry=https://npm.pkg.github.com
   ```

## Option B: Install from Git (no publish)

Users can install directly without publishing:
```bash
npm install "github:panditdhamdhere/AgentFoundry#main:packages/sdk"
```
Add to package.json: `"agentfoundry-sdk": "github:panditdhamdhere/AgentFoundry#main:packages/sdk"`

## Option C: npm (requires 2FA "Auth and Writes")

1. In package.json, change name back to `@agentfoundry/sdk` and remove `publishConfig`.
2. Create the `@agentfoundry` org on npm and add your account.
3. Enable 2FA "Auth and Writes" at npmjs.com → Account settings.
4. `npm login` then `npm publish --access public`
