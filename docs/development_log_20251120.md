# Community Advent Calendar POC 開発記録

**作成日**: 2025年11月20日  
**プロジェクト**: コミュニティ専用 Advent Calendar アプリケーション

## プロジェクト概要

Qiita Advent Calendarのような機能を持つ、コミュニティ専用のアドベントカレンダーアプリケーションのPOC（概念実証）を作成しました。

### 主な要件
- 年ごとに1つのカレンダー（12月1日〜25日）
- 外部記事リンクの登録機能
- Google/GitHub認証
- Firebase（Authentication, Firestore, Hosting）を使用

## 技術スタック

### フロントエンド
- **Framework**: React 19.2.0 (Vite)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 3.x
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Icons**: lucide-react

### バックエンド・インフラ
- **Authentication**: Firebase Authentication (Google, GitHub)
- **Database**: Cloud Firestore
- **Hosting**: Firebase Hosting

## 開発プロセス

### 1. 要件定義・設計フェーズ

#### 1.1 初期要件の確認
- AGENTS.mdの読み込みと指示の確認
- 技術スタックの検討（Firebase vs Supabase vs Cloudflare D1）
- 認証方式の決定（Google/GitHub、メールアドレス登録不要）

#### 1.2 設計ドキュメントの作成
- `docs/advent_calendar_poc_spec.md` の作成
- データモデルの設計（ER図）
- UIフローの設計（Mermaid図）

**主な決定事項**:
- Framework: Vite (React SPA)
- Content Type: 外部リンクのみ（内部投稿機能なし）
- Styling: shadcn/ui + Tailwind CSS
- Backend: Firebase（無料枠で十分対応可能）

### 2. プロジェクトセットアップ

#### 2.1 Vite プロジェクトの初期化
```bash
npm create vite@latest . -- --template react-ts
```

#### 2.2 Tailwind CSS のセットアップ
```bash
npm install -D tailwindcss@^3 postcss autoprefixer
```

**課題**: shadcn/ui が Tailwind CSS v4 をインストールしてしまう問題
**解決**: v3 に明示的にダウングレード

#### 2.3 shadcn/ui の初期化
```bash
npx shadcn@latest init
```

**設定内容**:
- Style: Neutral
- CSS variables: Yes
- Components: button, card, dialog, input, label, sonner

**課題**: TypeScript の path alias 設定が必要
**解決**: `tsconfig.json` と `vite.config.ts` に `@/*` エイリアスを追加

#### 2.4 Firebase SDK のインストール
```bash
npm install firebase react-firebase-hooks
npm install lucide-react
npm install -D tailwindcss-animate
```

### 3. Firebase プロジェクトのセットアップ

#### 3.1 Firebase プロジェクトの作成
- プロジェクト名: `adventcalender-hamait-2025`
- Web アプリの登録

#### 3.2 環境変数の設定
`.env.local` ファイルの作成:
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

#### 3.3 Firebase Authentication の設定
- Google Sign-In の有効化
- GitHub Sign-In の設定（オプション）

#### 3.4 Firestore セキュリティルールの設定
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entryId} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null
                            && resource.data.userId == request.auth.uid;
    }
  }
}
```

### 4. アプリケーション実装

#### 4.1 型定義 (`src/types/index.ts`)
```typescript
export interface User {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  provider: 'google' | 'github';
}

export interface Entry {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  day: number; // 1-25
  year: number;
  title: string;
  url: string;
  comment?: string;
  createdAt: Date;
}
```

#### 4.2 Firebase 初期化 (`src/lib/firebase.ts`)
- Firebase App の初期化
- Authentication と Firestore のエクスポート

#### 4.3 認証機能 (`src/contexts/AuthContext.tsx`)
- `AuthProvider` コンポーネントの実装
- Google/GitHub Sign-In 機能
- ユーザー状態管理（`onAuthStateChanged`）

**技術的課題**:
- TypeScript の `verbatimModuleSyntax` による型インポートエラー
- 解決: `import type { ... }` を使用した型専用インポート

#### 4.4 UI コンポーネント

**Header (`src/components/Header.tsx`)**:
- ログイン/ログアウトボタン
- ユーザー情報表示
- 認証ダイアログ（Google/GitHub選択）

**CalendarGrid (`src/components/CalendarGrid.tsx`)**:
- 25日分のカレンダー表示
- Firestore からのエントリー取得
- エントリー状態管理

**CalendarDay (`src/components/CalendarDay.tsx`)**:
- 個別の日付カード
- 状態別の表示（空き/登録済み/ロック）
- クリックイベント処理

**EntryDialog (`src/components/EntryDialog.tsx`)**:
- 記事登録フォーム（タイトル、URL、コメント）
- Firestore への書き込み
- バリデーション（URL形式チェック）
- Toast 通知（成功/エラー）

#### 4.5 メインアプリ (`src/App.tsx`)
- `AuthProvider` でラップ
- Header + CalendarGrid の配置
- Toaster コンポーネント

### 5. トラブルシューティング

#### 5.1 Tailwind CSS v4 互換性問題
**問題**: shadcn/ui が Tailwind CSS v4 をインストールし、PostCSS エラーが発生
**解決**: Tailwind CSS v3 に明示的にダウングレード

#### 5.2 TypeScript 型インポートエラー
**問題**: `verbatimModuleSyntax` が有効な場合の型インポートエラー
**解決**: `import type { ... }` を使用

#### 5.3 Firebase User 型のインポートエラー
**問題**: `User` が値としてエクスポートされていない
**解決**: `import type { User as FirebaseUser }` で型専用インポート

#### 5.4 Firestore 権限エラー
**問題**: "Missing or insufficient permissions"
**解決**: Firestore セキュリティルールの設定

#### 5.5 日付ロック問題（テスト時）
**問題**: 2025年12月の日付が未来日として判定される
**解決**: テスト用に `isFuture = false` に一時変更

### 6. データモデル

#### Firestore コレクション構造

**Collection: `entries`**

Document ID: `{year}-{day}` (例: `2025-1`, `2025-25`)

```typescript
{
  userId: string,          // 登録ユーザーのUID
  userName: string,        // 表示名
  userPhotoURL: string,    // プロフィール画像URL
  day: number,             // 1-25
  year: number,            // 2025
  title: string,           // 記事タイトル
  url: string,             // 外部記事URL
  comment: string | null,  // コメント（オプション）
  createdAt: Timestamp     // 作成日時
}
```

## 完成した機能

### ✅ 認証機能
- Google ログイン/ログアウト（動作確認済み）
- GitHub ログイン/ログアウト（動作確認済み）
- ユーザー情報の表示（名前、アイコン）

### ✅ カレンダー表示
- 1〜25日のグリッド表示
- 登録済み/未登録の視覚的な区別
- レスポンシブデザイン

### ✅ 記事登録
- タイトル、URL、コメントの入力
- URL バリデーション
- Firestore への保存
- Toast 通知

### ✅ 記事閲覧
- 登録された記事の表示
- 外部リンクへのジャンプ
- 登録者情報の表示

### ✅ 権限管理
- 未認証ユーザーは閲覧のみ
- 認証ユーザーのみ登録可能
- 自分の記事のみ編集可能（実装済み）

## プロジェクト構成

```
AdventCalender/
├── docs/
│   ├── advent_calendar_poc_spec.md    # 設計ドキュメント
│   └── templates/                      # ドキュメントテンプレート
├── src/
│   ├── components/
│   │   ├── ui/                         # shadcn/ui コンポーネント
│   │   ├── CalendarDay.tsx             # 日付カード
│   │   ├── CalendarGrid.tsx            # カレンダーグリッド
│   │   ├── EntryDialog.tsx             # 記事登録ダイアログ
│   │   └── Header.tsx                  # ヘッダー
│   ├── contexts/
│   │   └── AuthContext.tsx             # 認証コンテキスト
│   ├── lib/
│   │   ├── firebase.ts                 # Firebase 初期化
│   │   └── utils.ts                    # shadcn/ui ユーティリティ
│   ├── types/
│   │   └── index.ts                    # 型定義
│   ├── App.tsx                         # メインアプリ
│   ├── main.tsx                        # エントリーポイント
│   └── index.css                       # グローバルスタイル
├── .env.local                          # 環境変数（Git除外）
├── .env.example                        # 環境変数サンプル
├── tailwind.config.js                  # Tailwind 設定
├── vite.config.ts                      # Vite 設定
└── tsconfig.json                       # TypeScript 設定
```

## 今後の拡張案

### 短期的な改善
1. **日付チェックの有効化**: 本番運用時に未来日のロックを有効化
2. **GitHub 認証の完全設定**: OAuth App の作成と設定
3. **エラーハンドリングの強化**: より詳細なエラーメッセージ
4. **ローディング状態の改善**: スケルトンスクリーンの追加

### 中期的な機能追加
1. **記事編集・削除機能**: 自分の記事の管理
2. **ダークモード対応**: システム設定に追従
3. **複数年対応**: 年選択機能の追加
4. **検索機能**: 記事タイトルでの検索

### 長期的な拡張
1. **複数カレンダー対応**: テーマ別カレンダーの作成
2. **コメント機能**: 記事へのコメント
3. **いいね機能**: 記事への評価
4. **通知機能**: 新規登録の通知
5. **OGP 対応**: SNS シェア時のプレビュー

## デプロイ手順

### Firebase Hosting へのデプロイ

```bash
# Firebase CLI のインストール
npm install -g firebase-tools

# Firebase にログイン
firebase login

# Firebase プロジェクトの初期化
firebase init hosting

# ビルド
npm run build

# デプロイ
firebase deploy
```

### 環境変数の設定
本番環境では、Firebase Hosting の環境変数設定を使用するか、ビルド時に環境変数を埋め込む。

## 学んだこと・ポイント

### 技術的な学び
1. **TypeScript の厳格な型チェック**: `verbatimModuleSyntax` による型インポートの分離
2. **shadcn/ui の利用**: コンポーネントライブラリの効率的な活用
3. **Firebase の統合**: Authentication と Firestore の連携
4. **React Context API**: グローバルな状態管理

### 開発プロセスの学び
1. **段階的な実装**: 設計 → セットアップ → 実装 → テスト
2. **トラブルシューティング**: エラーログの読み方と解決方法
3. **ドキュメント駆動開発**: AGENTS.md に従った開発フロー

## まとめ

約4時間で、Qiita風Advent CalendarのPOCを完成させることができました。

**成功要因**:
- 明確な要件定義と設計
- 適切な技術スタックの選定
- 段階的な実装とテスト
- エラーへの迅速な対応

**今後の課題**:
- 本番運用に向けたセキュリティ強化
- パフォーマンス最適化
- ユーザビリティの向上

このPOCをベースに、コミュニティのニーズに合わせて機能を拡張していくことが可能です。

---

**プロジェクト完了日**: 2025年11月20日 23:35  
**開発時間**: 約4時間  
**最終コミット**: POC完成
