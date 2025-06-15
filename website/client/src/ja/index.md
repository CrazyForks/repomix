---
layout: home
title: Repomix
titleTemplate: コードベースをAIフレンドリーな形式にパッケージング
aside: false
editLink: false

features:
  - icon: 🤖
    title: AI最適化
    details: コードベースをAIが理解・処理しやすい形式にフォーマット

  - icon: ⚙️
    title: Git対応
    details: .gitignoreファイルを自動的に認識し、適切なファイル除外

  - icon: 🛡️
    title: セキュリティ重視
    details: Secretlintを組み込み、機密情報の検出と除外

  - icon: 📊
    title: トークンカウント
    details: ファイルごとおよびコードベース全体のトークン数を計測し、LLMのコンテキスト制限に対応

---

<script setup>
import YouTubeVideo from '../../components/YouTubeVideo.vue'
import { VIDEO_IDS } from '../../utils/videos'
</script>

<div class="cli-section">

[![Sponsors](https://cdn.jsdelivr.net/gh/yamadashy/sponsor-list/sponsors/sponsors.png)](https://github.com/sponsors/yamadashy)

## 🏆 オープンソースアワードノミネート

光栄です！Repomixが[JSNation Open Source Awards 2025](https://osawards.com/javascript/)の**Powered by AI**カテゴリにノミネートされました。

これは皆様がRepomixを使用し、サポートしてくださったおかげです。ありがとうございます！

RepomixがAIツール向けのコードベース分析やパッケージングにお役に立った場合、**Powered by AI**カテゴリでの投票をお願いいたします。

## Repomixとは？

Repomixは、コードベース全体を単一のAIフレンドリーなファイルにパッケージ化する強力なツールです。コードレビュー、リファクタリング、プロジェクトに関するAIアシスタンスが必要な場合に、リポジトリ全体のコンテキストをAIツールと簡単に共有できます。

<YouTubeVideo :videoId="VIDEO_IDS.REPOMIX_DEMO" />

## クイックスタート

Repomixを使用すると、コードベース全体を1ファイル（`repomix-output.xml`）にできます。

そのまま ChatGPT や Claude などのAIアシスタントに次のようなプロンプトと一緒に送ると、

```
このファイルはコードベース内のファイルを1つにまとめたものです。
コードのリファクタリングを行いたいので、まずはコードレビューをお願いします。
```

全体の内容を理解した上で、リファクタリングなどを進めることができます。

![Repomixの使用例1](/images/docs/repomix-file-usage-1.png)

具体的な内容を提案すると、それに従って良い感じのコードを生成してくれます。Claude だと Artifacts 機能で複数のファイルが出力できるため、依存関係にある複数のコードも一緒に生成できます。

![Repomixの使用例2](/images/docs/repomix-file-usage-2.png)

良いコーディング体験を！🚀

## CLIの使用方法 {#using-the-cli-tool}

Repomixは強力な機能とカスタマイズオプションを提供するコマンドラインツールとして使用できます。

**CLIツールはプライベートリポジトリにアクセスできます**。これはローカルにインストールされたgitを使用するためです。

### クイックスタート

任意のディレクトリで以下のコマンドを実行すると、 `repomix-output.xml` が生成され、それ以降の使い方は同様です。

```bash
npx repomix
```

または、グローバルにインストールして繰り返し使用することもできます。

```bash
# npmを使用してインストール
npm install -g repomix

# または、yarnを使用
yarn global add repomix

# または、bunを使用
bun add -g repomix

# または、Homebrewを使用（macOS/Linux）
brew install repomix

# その後、任意のプロジェクトディレクトリで実行
repomix
```


### CLIの使用方法

カレントディレクトリ全体をまとめる。

```bash
repomix
```

特定のディレクトリをまとめる。

```bash
repomix path/to/directory
```

[glob パターン](https://github.com/mrmlnc/fast-glob?tab=readme-ov-file#pattern-syntax)を使用して特定のファイルやディレクトリを指定。

```bash
repomix --include "src/**/*.ts,**/*.md"
```

特定のファイルやディレクトリを除外。

```bash
repomix --ignore "**/*.log,tmp/"
```

リモートリポジトリをまとめる。

```bash
# ショートハンド形式を使用
npx repomix --remote yamadashy/repomix

# 完全なURL（ブランチや特定のパスをサポート）
npx repomix --remote https://github.com/yamadashy/repomix
npx repomix --remote https://github.com/yamadashy/repomix/tree/main

# コミットのURLを使用
npx repomix --remote https://github.com/yamadashy/repomix/commit/836abcd7335137228ad77feb28655d85712680f1
```

設定ファイル（`repomix.config.json`）の初期化

```bash
repomix --init
```

生成されたファイルは、Claude、ChatGPT、Geminiなどの生成AIツールで使用できます。

### Docker使用方法 🐳

Dockerを使用してRepomixを実行することも可能で、分離された環境でRepomixを実行したい場合に便利です。

基本的な使用方法

```bash
docker run -v .:/app -it --rm ghcr.io/yamadashy/repomix
```

特定のディレクトリをまとめる
```bash
docker run -v .:/app -it --rm ghcr.io/yamadashy/repomix path/to/directory
```

リモートリポジトリを処理し、`output`ディレクトリに出力

```bash
docker run -v ./output:/app -it --rm ghcr.io/yamadashy/repomix --remote https://github.com/yamadashy/repomix
```

### 出力フォーマット

出力フォーマットは3種類あり、`xml`, `markdown`, `plain` を選択できます。
LLMによっては得意・不得意があるので、適切なフォーマットを選択してください。

```bash
# XMLフォーマット（デフォルト）
repomix --style xml

# Markdownフォーマット
repomix --style markdown

# プレーンテキストフォーマット
repomix --style plain
```

### カスタマイズ

フォルダごとの永続的な設定のために`repomix --init`で`repomix.config.json`を作成できます。

```json
{
  "output": {
    "style": "markdown",
    "filePath": "custom-output.md",
    "removeComments": true,
    "showLineNumbers": true,
    "topFilesLength": 10
  },
  "ignore": {
    "customPatterns": ["*.test.ts", "docs/**"]
  }
}
```

## パワーユーザーガイド

Repomixは高度な用途向けの強力な機能を提供します。パワーユーザー向けの重要なガイドをご紹介します：

- **[MCPサーバー](./guide/mcp-server)** - AIアシスタント向けModel Context Protocol統合
- **[GitHub Actions](./guide/github-actions)** - CI/CDワークフローでのコードベース自動パッケージング
- **[コード圧縮](./guide/code-compress)** - Tree-sitterベースのインテリジェント圧縮（約70%のトークン削減）
- **[ライブラリとして使用](./guide/development/using-repomix-as-a-library)** - Node.jsアプリケーションへのRepomix統合
- **[カスタム指示](./guide/custom-instructions)** - 出力にカスタムプロンプトと指示を追加
- **[セキュリティ機能](./guide/security)** - 組み込みSecretlint統合と安全性チェック
- **[ベストプラクティス](./guide/tips/best-practices)** - 実証済みの戦略でAIワークフローを最適化

### その他の例
::: tip もっと詳しく知りたい場合は？ 💡
詳しい使い方は[ガイド](./guide/)をご覧ください。コード例やソースコードは[GitHubリポジトリ](https://github.com/yamadashy/repomix)で確認できます。
:::

</div>
