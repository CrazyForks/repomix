# 基本用法

## 快速開始

打包整個倉庫：
```bash
repomix
```

## 常見使用場景

### 打包指定目錄
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

### 處理遠端倉庫
```bash
# 使用 GitHub URL
repomix --remote https://github.com/user/repo

# 使用簡寫形式
repomix --remote user/repo

# 指定分支/標籤/提交
repomix --remote user/repo --remote-branch main
repomix --remote user/repo --remote-branch 935b695
```

### 文件列表輸入（stdin）

通過 stdin 傳遞文件路徑以獲得終極靈活性：

```bash
# 使用 find 命令
find src -name "*.ts" -type f | repomix --stdin

# 使用 git 獲取追蹤的文件
git ls-files "*.ts" | repomix --stdin

# 使用 ripgrep (rg) 查找文件
rg --files --type ts | repomix --stdin

# 使用 grep 查找包含特定內容的文件
grep -l "TODO" **/*.ts | repomix --stdin

# 使用 ripgrep 查找包含特定內容的文件
rg -l "TODO|FIXME" --type ts | repomix --stdin

# 使用 sharkdp/fd 查找文件
fd -e ts | repomix --stdin

# 使用 fzf 從所有文件中選擇
fzf -m | repomix --stdin

# 使用 fzf 進行互動式文件選擇
find . -name "*.ts" -type f | fzf -m | repomix --stdin

# 使用 ls 和 glob 模式
ls src/**/*.ts | repomix --stdin

# 從包含文件路徑的文件中讀取
cat file-list.txt | repomix --stdin

# 使用 echo 直接輸入
echo -e "src/index.ts\nsrc/utils.ts" | repomix --stdin
```

`--stdin` 選項允許您向 Repomix 傳遞文件路徑列表，在選擇要打包的文件時提供終極靈活性。

使用 `--stdin` 時，指定的文件實際上被添加到包含模式中。這意味著正常的包含和忽略行為仍然適用 - 通過 stdin 指定的文件如果匹配忽略模式仍會被排除。

> [!NOTE]
> 使用 `--stdin` 時，文件路徑可以是相對路徑或絕對路徑，Repomix 會自動處理路徑解析和去重。

### 程式碼壓縮

```bash
repomix --compress

# 您也可以將其用於遠端倉庫：
repomix --remote yamadashy/repomix --compress
```

## 輸出格式

### XML（預設）
```bash
repomix --style xml
```

### Markdown
```bash
repomix --style markdown
```

### 純文字
```bash
repomix --style plain
```

## 其他選項

### 移除註釋
```bash
repomix --remove-comments
```

### 顯示行號
```bash
repomix --output-show-line-numbers
```

### 複製到剪貼簿
```bash
repomix --copy
```

### 禁用安全檢查
```bash
repomix --no-security-check
```

## 配置

初始化配置文件：
```bash
repomix --init
```

更多詳細配置選項請參閱[配置指南](/zh-tw/guide/configuration)。
