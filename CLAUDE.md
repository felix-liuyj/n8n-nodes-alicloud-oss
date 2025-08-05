# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an n8n community node package that provides Alibaba Cloud OSS (Object Storage Service) operations for n8n workflows. It enables users to upload, download, list, and delete objects in Alibaba Cloud OSS buckets directly from n8n workflows.

## Architecture

### Key Components

- **Node Implementation**: `nodes/AlicloudOss/AlicloudOss.node.ts` - Main OSS node with upload/download/list/delete operations
- **Credentials**: Both embedded (`AlicloudOssApi` class in node file) and separate credential files
- **Build System**: Uses TypeScript compilation + Gulp for asset copying

### Node Structure

The main node (`AlicloudOssNode` class) implements `INodeType` with:
- Four operations: upload, download, list objects, and delete
- Binary data handling for file uploads/downloads
- OSS client configuration using `ali-oss` SDK
- Credential-based authentication with AccessKey ID/Secret

### Embedded Credentials

The node file contains an embedded credential type (`AlicloudOssApi`) with:
- AccessKey ID and Secret for authentication
- Region and Bucket configuration
- Optional custom endpoint support

## Development Commands

### Build and Development
- `npm run build` - Full build (TypeScript compilation + icon copying)
- `npm run dev` - Development mode with TypeScript watch
- `npm run format` - Format code with Prettier
- `npm run lint` - Run ESLint on nodes, credentials, and package.json
- `npm run lintfix` - Auto-fix ESLint issues

### Publishing
- `npm run prepublishOnly` - Pre-publish checks (build + lint with prepublish config)
- `npm run publicPublish` - Publish to npm with public access

## Code Standards

### TypeScript Configuration
- Target: ES2019
- Strict mode enabled
- Output to `dist/` directory
- Source maps and declarations generated

### Linting
- Uses `eslint-plugin-n8n-nodes-base` with community package rules
- Separate rule sets for credentials and nodes
- Comprehensive n8n-specific rules for naming, structure, and conventions

### Code Style (Prettier)
- Single quotes, semicolons, trailing commas
- Tabs with width 2
- Line width: 100 characters
- LF line endings

## Key Dependencies

- **Runtime**: `ali-oss` for Alibaba Cloud OSS SDK operations
- **Development**: TypeScript, ESLint with n8n plugin, Prettier, Gulp, `@types/ali-oss` for TypeScript definitions
- **Peer**: `n8n-workflow` (provided by n8n runtime)

## File Structure Notes

- Source files in `nodes/` and `credentials/` directories
- Build output goes to `dist/` directory
- Icons (SVG/PNG) are copied during build process
- Package exports only the `dist` directory
- Node file contains both node and credential implementations

## Implementation Details

### OSS Operations
- **Upload**: Handles binary data upload to OSS with configurable object keys
- **Download**: Retrieves objects from OSS and returns as binary data
- **List**: Lists objects with optional prefix filtering (max 1000 objects)
- **Delete**: Removes objects from OSS by object key

### Error Handling
- Uses `continueOnFail()` to determine whether to throw errors or return error objects
- All operations wrapped in try-catch blocks for graceful error handling

### Binary Data Processing
- Uses n8n's `helpers.assertBinaryData()` for upload operations
- Uses `helpers.prepareBinaryData()` for download operations
- Configurable binary property names for flexibility