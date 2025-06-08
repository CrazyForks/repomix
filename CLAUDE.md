# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Continuous Knowledge Updates

**ALWAYS update this CLAUDE.md file during development tasks when you learn:**
- New project-specific patterns or conventions
- Solutions to common problems or edge cases
- Debugging techniques specific to this codebase
- Tool usage patterns that improve efficiency
- Review feedback patterns that could help future development
- Architecture decisions and their rationale

**When to update:** Don't wait until task completion - update immediately when you discover useful knowledge that would benefit future development sessions. This ensures knowledge continuity across different coding sessions.

# Repomix Development Guide

Repomix is a tool that packs repository contents into single files optimized for AI consumption. It converts codebases into structured formats (XML, Markdown, Plain Text) with intelligent compression, security scanning, and token counting for LLM integration.

## Build & Development Commands
- `npm run build` - Build the project
- `npm run lint` - Run all linters (Biome, TypeScript, secretlint)
- `npm run lint-biome` - Run Biome linter with auto-fix
- `npm run lint-ts` - Run TypeScript type checking
- `npm test` - Run all tests
- `npm test -- /path/to/file.test.ts` - Run a specific test file
- `npm test -- -t "test name"` - Run tests matching description
- `npm run test-coverage` - Run tests with coverage report
- `npm run repomix` - Build and run the CLI tool
- `npm run repomix-src` - Pack only src and tests directories
- `npm run repomix-website` - Pack only website directory
- `npm run website` - Start local website development environment
- `npm run website-generate-schema` - Generate JSON schema for configuration

## Core Architecture

### File Processing Pipeline (`src/core/file/`)
- **fileCollect.ts**: Parallel file reading with worker threads for performance
- **fileProcess.ts**: Content transformation including comment removal and formatting
- **fileSearch.ts**: Glob pattern-based file discovery with gitignore integration
- **filePathSort.ts**: Git-aware file ordering by change frequency for optimal AI context

### Security & Validation (`src/core/security/`)
- **securityCheck.ts**: Multi-threaded Secretlint integration for sensitive data detection
- **validateFileSafety.ts**: Pre-processing file safety validation
- Uses worker threads for concurrent security scanning to prevent blocking

### Output Generation (`src/core/output/`)
- **outputGenerate.ts**: Multi-format support (XML default, Markdown, Plain Text)
- **outputStyles/**: Format-specific templates with Handlebars templating
- **outputStyleDecorate.ts**: Content decoration with line numbers and headers

### Tree-Sitter Integration (`src/core/treeSitter/`)
- **languageParser.ts**: 15+ language support for intelligent code parsing
- **parseStrategies/**: Language-specific parsing strategies for optimal compression
- Achieves ~70% token reduction while preserving semantic meaning

### CLI Architecture (`src/cli/`)
- **cliRun.ts**: Main CLI orchestrator using Commander.js
- **actions/**: Modular command handlers (default, remote, init, mcp, version)
- **defaultAction.ts**: Standard local repository processing workflow
- **remoteAction.ts**: GitHub URL/shorthand processing with branch/commit resolution

### MCP Server (`src/mcp/`)
- **mcpServer.ts**: Model Context Protocol server for AI assistant integration
- **tools/**: File system access, repository packing, and content search capabilities
- Provides sandboxed AI-to-codebase interaction layer

## Code Style Guidelines
- **Formatting**: 2 spaces indentation, 120 char line width, single quotes, trailing commas
- **Imports**: Use `node:` prefix for built-ins, `.js` extension for relative imports, `import type` for types
- **TypeScript**: Strict type checking, explicit return types, prefer interfaces for object types
- **Error Handling**: Custom errors extend `RepomixError`, descriptive messages, proper try/catch
- **Dependencies**: Inject dependencies through deps object parameter for testability
- **File Structure**: Keep files under 250 lines, organize by feature, use workers for concurrent operations
- **Testing**: Use Vitest, mock dependencies, descriptive test names, arrange/act/assert pattern

## Naming Conventions
- PascalCase: Classes, interfaces, types
- camelCase: Variables, functions, methods, file names
- Test files: `[filename].test.ts`

## Key Design Patterns

### Worker Thread Architecture
- CPU-intensive operations (file processing, security checks, metrics) use Piscina worker pools
- **Workers**: `src/core/file/workers/`, `src/core/security/workers/`, `src/core/metrics/workers/`
- Enables concurrent processing while keeping main thread responsive

### Dependency Injection
- Functions accept `deps` object parameter containing dependencies for testability
- Example: `fileCollect(paths, options, deps = { readFile, processFile })`
- Enables easy mocking in tests and flexible runtime configuration

### Configuration System
- **configSchema.ts**: Zod-based type-safe configuration with runtime validation
- **configLoad.ts**: Hierarchical config merging (global → project → CLI options)
- Supports JSON5 format for comments in configuration files

### Error Handling
- All custom errors extend `RepomixError` base class in `src/shared/errorHandle.ts`
- Structured error types with context information for debugging
- Proper error propagation through async/worker boundaries

## Git Workflow

### Pre-Commit Requirements (MANDATORY)
**ALWAYS run these commands before every commit:**
```bash
npm run lint
npm run test
```

- **npm run lint**: Runs Biome formatter, TypeScript type checking, and Secretlint security scan
- **npm run test**: Executes full test suite to ensure no regressions
- **Never commit failing code**: Fix all lint errors and test failures before committing
- **Use `--write` flag**: Biome will auto-fix formatting issues when possible

### Commit Message Format
- Follow [Conventional Commits](https://www.conventionalcommits.org/) with scope: `type(scope): Description`
- **Write all commit messages in English** - both title and body must be in English for consistency
- Write detailed commit messages focusing on the "why" rather than the "what"
- **Include user dialogue context**: Reference the specific conversation or request that led to the change in the commit body
- Format: Use title for technical change, body with clear dialogue section marker and summary
- Start with dialogue type summary, then provide bullet points of the conversation flow
- If user spoke in another language, translate their quotes to English in the commit message
- Examples: 
  ```
  feat(cli): Add new --no-progress flag
  
  User requested a feature enhancement for CI automation:
  - User asked: "Can we disable progress output for CI environments?"
  - User explained: "Progress output creates noise in build logs"
  - Assistant implemented --no-progress flag for automation compatibility
  
  🤖 Generated with [Claude Code](https://claude.ai/code)
  
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

## Pull Request Review Process

### Viewing PR Comments
There are different types of comments in GitHub PRs that require different approaches to view:

**1. General PR Comments (in main conversation):**
```bash
gh pr view {PR_NUMBER} --comments
```

**2. Specific Code Line Comments (Files changed tab):**
```bash
gh api repos/yamadashy/repomix/pulls/{PR_NUMBER}/comments --jq '.[] | {path: .path, line: .line, body: .body}'
```

**3. Review Comments with Status:**
```bash
gh api repos/yamadashy/repomix/pulls/{PR_NUMBER}/reviews --jq '.[] | select(.state == "COMMENTED" or .state == "CHANGES_REQUESTED") | .body'
```

### Automated Review Bots
This repository uses several automated review tools:

- **CodeRabbit**: AI-powered code review with actionable suggestions
- **Gemini Code Assist**: Google's AI code reviewer with severity ratings (High/Medium/Low)
- **Copilot Pull Request Reviewer**: GitHub's automated review suggestions
- **Codecov**: Test coverage analysis and reporting

### Responding to Review Feedback

**1. Address Technical Issues First:**
- Fix high-priority issues (security, functionality, memory leaks)
- Address medium-priority issues (UX, maintainability)
- Consider low-priority suggestions for future improvements

**2. Commit Changes with Clear Messages:**
```bash
git commit -m "fix(scope): Address PR review feedback

- Fix specific issue 1 (reference commit/line if applicable)
- Improve specific aspect 2
- Address reviewer concern about X

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**3. Respond to Reviewers:**
- Use `gh pr comment {PR_NUMBER} --body "message"` for general responses
- Reference specific commits that address issues: `Fixed in commit \`abc1234\``
- Explain rationale for decisions when not implementing suggestions
- Thank reviewers for their feedback

**4. Resolve Conversations (IMPORTANT!):**
- **Always resolve addressed feedback** - this helps track progress and shows respect for reviewers
- CodeRabbit: Use `@coderabbitai resolve` command in PR comments
- Others: Respond with explanation, then let reviewers mark as resolved
- GitHub Web UI: Use "Resolve conversation" button on Files changed tab
- **Don't forget this step** - unresolved conversations can delay PR approval

### Common Review Issues and Solutions

**Vue.js/Frontend:**
- Event listener cleanup: Use `onUnmounted()` instead of return functions in `onMounted()`
- Disabled element events: Move event handlers to parent containers
- CSS positioning: Consider `position: fixed` for tooltips to avoid parent overflow issues
- Accessibility: Maintain ARIA labels and proper focus management

**Performance:**
- Use `{ passive: true }` for scroll listeners
- Implement proper cleanup for all event listeners
- Consider debouncing/throttling for frequent events

**Code Quality:**
- Remove duplicate CSS definitions
- Use existing color schemes for consistency
- Follow established patterns in the codebase
- Maintain proper TypeScript typing

### Review Process Checklist

Before marking PR as ready for merge:

1. ✅ **Address all feedback** - Fix high/medium priority issues
2. ✅ **Run linting and tests (MANDATORY)** - `npm run lint && npm test` - Must pass before committing
3. ✅ **Commit with clear messages** - Reference what was fixed
4. ✅ **Respond to reviewers** - Explain changes and decisions
5. ✅ **Resolve conversations** - Mark addressed feedback as resolved
6. ✅ **Update documentation** - If architectural changes were made

**Remember**: Resolving conversations shows that feedback has been addressed and helps maintainers track review progress. This is essential for efficient PR management.

## Knowledge Management & Continuous Improvement

### Document Learning During Development

**Key principle:** Update CLAUDE.md immediately when discovering useful patterns, not at the end of tasks.

**Examples of knowledge worth documenting:**
- **Project quirks**: "Website uses `position: fixed` for tooltips due to parent `overflow: hidden`"
- **Tool discoveries**: "Use `gh api` for line-specific PR comments, `gh pr view --comments` for general ones"
- **Debug techniques**: "Check `canShareFiles()` implementation when Web Share API behaves unexpectedly"
- **Performance patterns**: "Always use `{ passive: true }` for scroll listeners in Vue components"
- **Architecture insights**: "tooltip-container pattern prevents disabled button event issues"

### Maintaining This File

- **Be specific**: Instead of "fix tooltip issues", write "move mouseenter to container for disabled buttons"
- **Include context**: Explain *why* a solution works, not just *what* to do
- **Reference locations**: Include file paths and line numbers when relevant
- **Update immediately**: Don't batch updates - add knowledge as you learn it
- **Cross-reference**: Link related sections (e.g., PR review patterns ↔ Vue.js best practices)

This file is a living document that should grow with every development session, ensuring no valuable knowledge is lost between tasks.
