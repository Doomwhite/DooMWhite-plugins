[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Doomwhite_DooMWhite-plugins&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Doomwhite_DooMWhite-plugins)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=Doomwhite_DooMWhite-plugins&metric=bugs)](https://sonarcloud.io/summary/new_code?id=Doomwhite_DooMWhite-plugins)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=Doomwhite_DooMWhite-plugins&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=Doomwhite_DooMWhite-plugins)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Doomwhite_DooMWhite-plugins&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Doomwhite_DooMWhite-plugins)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=Doomwhite_DooMWhite-plugins&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=Doomwhite_DooMWhite-plugins)

# DooMWhite's obsidian plugins

Those are all my obsidian plugins, all a single repository.

## How build

- `pnpm install`
- `pnpm common build` // To build the common dependencies module.
- `pnpm common:watch` // To build the common dependencies module, whenever there's a change.
- `pnpm {plugin-id} build` // To build the plugin

## How to make a new plugin workspace:

- Copy the apps\plugin-a file.
- Rename the plugin in the src/main.ts.
- Adjust the manifest file.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.
