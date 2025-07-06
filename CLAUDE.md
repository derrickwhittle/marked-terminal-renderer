# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a terminal renderer extension for [marked](https://github.com/markedjs/marked) that allows rendering markdown content in the terminal with colors, tables, code highlighting, and emojis.

## Key Commands

### Development
- `npm run build` - Build the project (TypeScript compilation + Rollup bundling)
- `npm run test` - Run Jest tests
- `npm run test:cover` - Run tests with coverage
- `npm run lint` - Run ESLint on TypeScript files
- `npm run format` - Format and fix code with ESLint and Prettier

### Testing
- `npm test` - Run all tests
- Individual test files can be run with `npx jest src/filename.spec.ts`

## Architecture

The project follows a modular architecture:

- **Main entry point**: `src/index.ts` - Exports the marked extension with configurable options
- **Renderer**: `src/renderer.ts` - Core `CliRenderer` class that extends marked's `Renderer`
- **Types**: `src/types.ts` - TypeScript type definitions
- **Utilities**: `src/utils.ts` - Helper functions for text processing and wrapping
- **Defaults**: `src/defaults.ts` - Default configuration for light/dark themes
- **Dependencies**: `src/deps.ts` - Centralized dependency imports

### Key Dependencies
- `chalk` - Terminal colors
- `cli-table3` - Table rendering
- `cli-highlight` - Code syntax highlighting
- `node-emoji` - Emoji support
- `word-wrap` - Text wrapping

## Configuration

The extension supports light and dark modes with extensive customization options defined in `CliRendererOptions`. The default mode is dark, configured in `src/defaults.ts`.

## Build Process

- TypeScript compilation to `lib/` directory
- Rollup bundling for ESM output
- Configured via `tsconfig.json` and `rollup.config.esm.js`

## Testing

Uses Jest with TypeScript support (`ts-jest` preset). Test files follow the pattern `*.spec.ts` and are located alongside source files in `src/`.