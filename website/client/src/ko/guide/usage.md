# 기본 사용법

## 빠른 시작

저장소 전체를 패키징:
```bash
repomix
```

## 일반적인 사용 사례

### 특정 디렉토리 패키징
```bash
repomix path/to/directory
```

### 특정 파일 포함
[glob 패턴](https://github.com/mrmlnc/fast-glob?tab=readme-ov-file#pattern-syntax) 사용:
```bash
repomix --include "src/**/*.ts,**/*.md"
```

### 파일 제외
```bash
repomix --ignore "**/*.log,tmp/"
```

### 원격 저장소 처리
```bash
# GitHub URL 사용
repomix --remote https://github.com/user/repo

# 단축형 사용
repomix --remote user/repo

# 특정 브랜치/태그/커밋
repomix --remote user/repo --remote-branch main
repomix --remote user/repo --remote-branch 935b695
```

### 파일 목록 입력 (stdin)

최고의 유연성을 위해 stdin을 통해 파일 경로를 전달하세요:

```bash
# find 명령 사용
find src -name "*.ts" -type f | repomix --stdin

# git을 사용하여 추적된 파일 가져오기
git ls-files "*.ts" | repomix --stdin

# ripgrep (rg) 을 사용하여 파일 찾기
rg --files --type ts | repomix --stdin

# grep을 사용하여 특정 내용을 포함하는 파일 찾기
grep -l "TODO" **/*.ts | repomix --stdin

# ripgrep을 사용하여 특정 내용을 포함하는 파일 찾기
rg -l "TODO|FIXME" --type ts | repomix --stdin

# sharkdp/fd 를 사용하여 파일 찾기
fd -e ts | repomix --stdin

# fzf를 사용하여 모든 파일에서 선택
fzf -m | repomix --stdin

# fzf를 사용한 대화형 파일 선택
find . -name "*.ts" -type f | fzf -m | repomix --stdin

# glob 패턴과 함께 ls 사용
ls src/**/*.ts | repomix --stdin

# 파일 경로가 포함된 파일에서
cat file-list.txt | repomix --stdin

# echo로 직접 입력
echo -e "src/index.ts\nsrc/utils.ts" | repomix --stdin
```

`--stdin` 옵션을 사용하면 파일 경로 목록을 Repomix로 파이프할 수 있어 패킹할 파일 선택에 최고의 유연성을 제공합니다.

`--stdin`을 사용할 때 지정된 파일은 실질적으로 include 패턴에 추가됩니다. 즉, 일반적인 include 및 ignore 동작이 여전히 적용되므로 stdin으로 지정한 파일도 ignore 패턴과 일치하면 제외됩니다.

> [!NOTE]
> `--stdin`을 사용할 때 파일 경로는 상대 경로 또는 절대 경로가 될 수 있으며, Repomix가 자동으로 경로 해석과 중복 제거를 처리합니다.

### 코드 압축

```bash
repomix --compress

# 원격 저장소에서도 사용할 수 있습니다:
repomix --remote yamadashy/repomix --compress
```

## 출력 형식

### XML (기본값)
```bash
repomix --style xml
```

### Markdown
```bash
repomix --style markdown
```

### 일반 텍스트
```bash
repomix --style plain
```

## 추가 옵션

### 주석 제거
```bash
repomix --remove-comments
```

### 행 번호 표시
```bash
repomix --output-show-line-numbers
```

### 클립보드에 복사
```bash
repomix --copy
```

### 보안 검사 비활성화
```bash
repomix --no-security-check
```

## 설정

설정 파일 초기화:
```bash
repomix --init
```

더 자세한 설정 옵션은 [설정 가이드](/ko/guide/configuration)를 참조하세요.
