# 基本用法

## 快速开始

打包整个仓库：
```bash
repomix
```

## 常见使用场景

### 打包指定目录
```bash
repomix path/to/directory
```

### 包含特定文件
使用 [glob 模式](https://github.com/mrmlnc/fast-glob?tab=readme-ov-file#pattern-syntax)：
```bash
repomix --include "src/**/*.ts,**/*.md"
```

### 排除文件
```bash
repomix --ignore "**/*.log,tmp/"
```

### 处理远程仓库
```bash
# 使用 GitHub URL
repomix --remote https://github.com/user/repo

# 使用简写形式
repomix --remote user/repo

# 指定分支/标签/提交
repomix --remote user/repo --remote-branch main
repomix --remote user/repo --remote-branch 935b695
```

### 文件列表输入（stdin）

通过 stdin 传递文件路径以获得终极灵活性：

```bash
# 使用 find 命令
find src -name "*.ts" -type f | repomix --stdin

# 使用 git 获取跟踪的文件
git ls-files "*.ts" | repomix --stdin

# 使用 ripgrep (rg) 查找文件
rg --files --type ts | repomix --stdin

# 使用 grep 查找包含特定内容的文件
grep -l "TODO" **/*.ts | repomix --stdin

# 使用 ripgrep 查找包含特定内容的文件
rg -l "TODO|FIXME" --type ts | repomix --stdin

# 使用 sharkdp/fd 查找文件
fd -e ts | repomix --stdin

# 使用 fzf 从所有文件中选择
fzf -m | repomix --stdin

# 使用 fzf 进行交互式文件选择
find . -name "*.ts" -type f | fzf -m | repomix --stdin

# 使用 ls 和 glob 模式
ls src/**/*.ts | repomix --stdin

# 从包含文件路径的文件中读取
cat file-list.txt | repomix --stdin

# 使用 echo 直接输入
echo -e "src/index.ts\nsrc/utils.ts" | repomix --stdin
```

`--stdin` 选项允许您向 Repomix 传递文件路径列表，在选择要打包的文件时提供终极灵活性。

> [!NOTE]
> 使用 `--stdin` 时，文件路径可以是相对路径或绝对路径，Repomix 会自动处理路径解析和去重。

### 代码压缩

```bash
repomix --compress

# 您也可以将其用于远程仓库：
repomix --remote yamadashy/repomix --compress
```

## 输出格式

### XML（默认）
```bash
repomix --style xml
```

### Markdown
```bash
repomix --style markdown
```

### 纯文本
```bash
repomix --style plain
```

## 其他选项

### 移除注释
```bash
repomix --remove-comments
```

### 显示行号
```bash
repomix --output-show-line-numbers
```

### 复制到剪贴板
```bash
repomix --copy
```

### 禁用安全检查
```bash
repomix --no-security-check
```

## 配置

初始化配置文件：
```bash
repomix --init
```

更多详细配置选项请参阅[配置指南](/zh-cn/guide/configuration)。
