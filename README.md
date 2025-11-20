# Community Advent Calendar POC

コミュニティ専用のAdvent Calendarアプリケーション（POC版）

## 📋 概要

Qiita Advent Calendarのようなコミュニティ向けのアドベントカレンダーアプリケーションです。
12月1日から25日まで、各日付に1つの記事を登録できます。

## ✨ 機能

- 🎄 12月1日〜25日のAdvent Calendar表示
- 🔐 Google/GitHub認証
- ✍️ 記事登録・閲覧機能
- 🔗 外部記事へのリンク
- 👥 ユーザープロフィール表示
- 📝 コメント機能（オプション）

## 🚀 セットアップ

### 前提条件

- Node.js 18以上
- Firebase プロジェクト（無料プランで可）

### インストール

```bash
npm install
```

### 環境変数の設定

`.env.example` を `.env.local` にコピーし、Firebase設定を記入してください。

```bash
cp .env.example .env.local
```

`.env.local` の内容:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

### Firebase設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Authentication → Sign-in methodで Google と GitHub を有効化
3. Firestore Databaseを作成
4. Firestore セキュリティルールを設定（`docs/tasks/phase1_implementation_plan.md` 参照）

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

### ビルド

```bash
npm run build
```

### プレビュー

```bash
npm run preview
```

## 🛠 技術スタック

### フロントエンド
- **React** 19.2.0 - UIフレームワーク
- **TypeScript** 5.9.3 - 型安全性
- **Vite** 7.2.4 - ビルドツール
- **Tailwind CSS** 3.x - スタイリング
- **shadcn/ui** - UIコンポーネント（Radix UIベース）

### バックエンド・インフラ
- **Firebase Authentication** - ユーザー認証
- **Cloud Firestore** - NoSQLデータベース
- **Firebase Hosting** - ホスティング（予定）

## 📚 ドキュメント

- [仕様書](./docs/advent_calendar_poc_spec.md) - 機能仕様とアーキテクチャ
- [ステアリングドキュメント](./docs/steering_document.md) - プロジェクト全体の進捗と計画
- [コードレビュー報告書（2025/11/20）](./docs/logs/code_review_20251120.md) - 品質評価と改善事項
- [Phase 1 実装計画](./docs/tasks/phase1_implementation_plan.md) - 本番運用準備のタスクリスト
- [開発ログ（2025/11/20）](./docs/development_log_20251120.md) - 開発履歴

## 📝 開発

### コミット規約

AGENTS.mdの規約に従います:

```
<emoji> <type>: <subject>

<body>
```

例:
```
✨ feat: カレンダーグリッドコンポーネントを実装

12月1日から25日までの25個の日付を表示するグリッドを作成しました。
各日付はクリック可能で、記事登録ダイアログを開きます。
```

### Lint

```bash
npm run lint
```

## 🚧 開発ステータス

### 現在の状況
- ✅ **POC完成**: 基本機能が動作確認済み
- ✅ **技術検証完了**: Firebase + React の構成で問題なく動作
- ✅ **コードレビュー完了**: 改善事項の特定完了（2025/11/21）
- 🔄 **Phase 1 開始**: 本番運用準備タスクを実施中

### 次のマイルストーン

**Phase 1: 本番運用準備**（作業時間: 約9時間）
- 🔴 Critical: 5タスク（約2時間）
- 🟡 High: 4タスク（約3時間）
- 🟢 Medium: 4タスク（約4時間）

詳細は [Phase 1 実装計画](./docs/tasks/phase1_implementation_plan.md) を参照してください。

## 📄 ライセンス

MIT

## 🤝 コントリビューション

POC段階のため、現在はクローズドで開発中です。

---

**作成日**: 2025年11月20日  
**最終更新**: 2025年11月21日

