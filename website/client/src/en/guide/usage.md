# Basic Usage

## Quick Start

Pack your entire repository:
```bash
repomix
```

## Common Use Cases

### Pack Specific Directories
```bash
repomix path/to/directory
```

### Include Specific Files
Use [glob patterns](https://github.com/mrmlnc/fast-glob?tab=readme-ov-file#pattern-syntax):
```bash
repomix --include "src/**/*.ts,**/*.md"
```

### Exclude Files
```bash
repomix --ignore "**/*.log,tmp/"
```

### Remote Repositories
```bash
# Using GitHub URL
repomix --remote https://github.com/user/repo

# Using shorthand
repomix --remote user/repo

# Specific branch/tag/commit
repomix --remote user/repo --remote-branch main
repomix --remote user/repo --remote-branch 935b695
```

### File List Input (stdin)

Pass file paths via stdin for ultimate flexibility:

```bash
# Using find command
find src -name "*.ts" -type f | repomix --stdin

# Using git to get tracked files
git ls-files "*.ts" | repomix --stdin

# Using ripgrep (rg) to find files
rg --files --type ts | repomix --stdin

# Using grep to find files containing specific content
grep -l "TODO" **/*.ts | repomix --stdin

# Using ripgrep to find files with specific content
rg -l "TODO|FIXME" --type ts | repomix --stdin

# Using sharkdp/fd to find files
fd -e ts | repomix --stdin

# Using fzf to select from all files
fzf -m | repomix --stdin

# Interactive file selection with fzf
find . -name "*.ts" -type f | fzf -m | repomix --stdin

# Using ls with glob patterns
ls src/**/*.ts | repomix --stdin

# From a file containing file paths
cat file-list.txt | repomix --stdin

# Direct input with echo
echo -e "src/index.ts\nsrc/utils.ts" | repomix --stdin
```

The `--stdin` option allows you to pipe a list of file paths to Repomix, giving you ultimate flexibility in selecting which files to pack.

When using `--stdin`, the specified files are effectively added to the include patterns. This means that the normal include and ignore behavior still applies - files specified via stdin will still be excluded if they match ignore patterns.

> [!NOTE]
> When using `--stdin`, file paths can be relative or absolute, and Repomix will automatically handle path resolution and deduplication.

### Code Compression

```bash
repomix --compress

# You can also use it with remote repositories:
repomix --remote yamadashy/repomix --compress
```

## Output Formats

### XML (Default)
```bash
repomix --style xml
```

### Markdown
```bash
repomix --style markdown
```

### Plain Text
```bash
repomix --style plain
```

## Additional Options

### Remove Comments
```bash
repomix --remove-comments
```

### Show Line Numbers
```bash
repomix --output-show-line-numbers
```

### Copy to Clipboard
```bash
repomix --copy
```

### Disable Security Check
```bash
repomix --no-security-check
```

## Configuration

Initialize configuration file:
```bash
repomix --init
```

See [Configuration Guide](/guide/configuration) for detailed options.
