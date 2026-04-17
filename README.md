# Forge Automation Action Demo

Forge automation action is now GA, see the [documentation](https://developer.atlassian.com/platform/forge/manifest-reference/modules/automation-action/) for more details.

This project contains a Forge app written in Javascript that adds a new custom action in Automation. This action can be used to create a new Atlassian group within a specific organization's directory using the Atlassian Admin APIs.

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge.

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Quick start

### 1. Register your app

Since the app is already created, you need to register it in your developer environment before deploying it.

- Register your app by running:

```sh
forge register
```

### 2. Set environment variables

Before deploying the app, you must create environment variables for `ORG_ID`, `ORG_API_KEY`, and `DIRECTORY_ID`. These are required for the app to authenticate with the Atlassian Admin API.

Use the `forge variables set` command to set them. For example, to set them in the `development` environment:

```sh
forge variables set --encrypt --environment development ORG_ID "<your-org-id>"
forge variables set --encrypt --environment development ORG_API_KEY "<your-org-api-key>"
forge variables set --encrypt --environment development DIRECTORY_ID "<your-directory-id>"
```

### 3. Develop and deploy

- Modify your app frontend by editing the `src/frontend/index.jsx` file.
- Modify your app actions by editing the `src/actions/index.js` file.
- Modify your app backend by editing the `src/resolvers/index.js` file to define resolver functions. See [Forge resolvers](https://developer.atlassian.com/platform/forge/runtime-reference/custom-ui-resolver/) for documentation on resolver functions.

- Install all packages and dependencies by running"

```sh
npm install
```

- Build and deploy your app by running:

```sh
forge deploy
```

- Install your app in an Atlassian site by running:

```sh
forge install
```

- Develop your app by running `forge tunnel` to proxy invocations locally:

```sh
forge tunnel
```

### Notes

- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.
