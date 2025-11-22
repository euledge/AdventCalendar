# テスト環境ガイド

**作成日**: 2025年11月22日  
**最終更新**: 2025年11月22日  
**対象**: 開発者

---

## 📋 概要

このドキュメントでは、Advent Calendar アプリケーションのローカルテスト環境について説明します。Firebase Emulator Suite を使用することで、本番環境に影響を与えることなく、安全にアプリケーションの開発・テストが行えます。

---

## 🎯 Firebase Emulator Suite とは

Firebase Emulator Suite は、Firebase のサービス（Authentication、Firestore、Hosting など）をローカル環境でエミュレートするツールです。

### メリット

- ✅ **本番データの保護**: 本番環境のデータに一切影響しない
- ✅ **高速な開発サイクル**: ネットワーク遅延なしで即座にテスト
- ✅ **コスト削減**: Firebase の使用量にカウントされない
- ✅ **オフライン開発**: インターネット接続なしで開発可能
- ✅ **リセット可能**: エミュレーター再起動でデータをクリア

---

## 🛠️ セットアップ

### 前提条件

- Node.js 18 以上
- Firebase CLI がインストール済み
  ```bash
  npm install -g firebase-tools
  ```

### 設定ファイル

#### 1. `firebase.json`

エミュレーターの設定が含まれています：

```json
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "emulators": {
    "hosting": {
      "port": 5000
    },
    "firestore": {
      "port": 8080
    },
    "auth": {
      "port": 9099
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

#### 2. `firestore.rules`

Firestore のセキュリティルールファイル。エミュレーターと本番環境の両方で使用されます。

#### 3. `src/lib/firebase.ts`

開発モード時に自動的にエミュレーターへ接続する設定：

```typescript
// Connect to Firebase Emulators in development mode
if (import.meta.env.MODE !== 'production') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

---

## 🚀 使用方法

### 1. エミュレーターの起動

```bash
npm run emulators
```

起動すると、以下のサービスが利用可能になります：

| サービス | アドレス | 用途 |
|---------|---------|------|
| **Emulator UI** | http://127.0.0.1:4000/ | 全エミュレーターの管理画面 |
| **Authentication** | 127.0.0.1:9099 | 認証エミュレーター |
| **Firestore** | 127.0.0.1:8080 | Firestore エミュレーター |
| **Hosting** | http://127.0.0.1:5000/ | ビルド済みアプリのホスティング |

### 2. 開発サーバーの起動（別ターミナル）

```bash
npm run dev
```

Vite 開発サーバーが起動し、自動的にエミュレーターに接続されます。

### 3. アプリケーションへのアクセス

ブラウザで http://localhost:5173/ を開きます。

---

## 🧪 テストシナリオ

### 基本的なテストフロー

#### 1. 認証テスト

1. 「ログイン」ボタンをクリック
2. Google または GitHub を選択
3. エミュレーターでは任意のメールアドレスで認証可能
4. Emulator UI の Authentication タブでユーザー情報を確認

#### 2. 記事登録テスト

1. ログイン後、カレンダーの日付（1〜25）をクリック
2. タイトルとURLを入力
3. 「登録」ボタンをクリック
4. Emulator UI の Firestore タブでデータを確認

#### 3. セキュリティルールのテスト

**未認証ユーザーのテスト**:
- ログアウト状態で日付をクリック → 登録ダイアログが開かないことを確認

**不正なデータのテスト**:
- 不正なURL（例: `javascript:alert(1)`）を入力 → エラーが表示されることを確認
- 空のタイトルで登録 → エラーが表示されることを確認

**他のユーザーのエントリー編集テスト**:
1. ユーザーAでログインして記事を登録
2. ログアウト
3. ユーザーBでログイン
4. ユーザーAの記事を編集しようとする → 失敗することを確認

#### 4. リアルタイム同期テスト（Task 6 実装後）

1. 2つのブラウザウィンドウを開く
2. 両方で http://localhost:5173/ にアクセス
3. 片方で記事を登録
4. もう片方で自動的に反映されることを確認

---

## 🔍 Emulator UI の使い方

### アクセス方法

http://127.0.0.1:4000/ をブラウザで開きます。

### 主な機能

#### 1. Authentication タブ
- 登録されたユーザーの一覧
- ユーザーの追加・削除
- カスタムトークンの生成

#### 2. Firestore タブ
- コレクションとドキュメントの閲覧
- データの追加・編集・削除
- クエリの実行

#### 3. Logs タブ
- すべてのエミュレーターのログを表示
- エラーやセキュリティルール違反の確認

---

## 📝 データの管理

### データのクリア

エミュレーターを再起動すると、すべてのデータがクリアされます：

```bash
# Ctrl+C でエミュレーターを停止
# 再度起動
npm run emulators
```

### データのエクスポート（将来的に）

```bash
firebase emulators:export ./emulator-data
```

### データのインポート（将来的に）

```bash
firebase emulators:start --import=./emulator-data
```

---

## ⚠️ 注意事項

### 1. ポートの競合

以下のポートが既に使用されている場合、エミュレーターは起動に失敗します：

- 4000 (Emulator UI)
- 5000 (Hosting)
- 8080 (Firestore)
- 9099 (Authentication)

**解決方法**: `firebase.json` の `emulators` セクションでポート番号を変更してください。

### 2. 環境変数

`.env.local` ファイルに Firebase の設定が必要です：

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. セキュリティルールの同期

`firestore.rules` を変更すると、エミュレーターは自動的にルールを再読み込みします。変更が反映されない場合は、エミュレーターを再起動してください。

### 4. 本番環境との切り替え

- **開発モード** (`npm run dev`): 自動的にエミュレーターに接続
- **本番ビルド** (`npm run build`): 本番環境の Firebase に接続

これは `src/lib/firebase.ts` の以下のコードで制御されています：

```typescript
if (import.meta.env.MODE !== 'production') {
  // エミュレーターに接続
}
```

---

## 🐛 トラブルシューティング

### エミュレーターが起動しない

**症状**: `Port XXXX is not open` エラー

**解決方法**:
1. 他のプロセスがポートを使用していないか確認
   ```bash
   netstat -ano | findstr :8080
   ```
2. `firebase.json` でポート番号を変更

### セキュリティルールのエラー

**症状**: `Unsupported operation error` などのエラー

**解決方法**:
1. `firestore.rules` の構文を確認
2. Emulator UI の Logs タブで詳細なエラーメッセージを確認
3. エミュレーターを再起動

### データが表示されない

**解決方法**:
1. Emulator UI の Firestore タブでデータが保存されているか確認
2. ブラウザのコンソールでエラーがないか確認
3. `src/lib/firebase.ts` でエミュレーターへの接続が正しく設定されているか確認

---

## 📚 参考リンク

- [Firebase Emulator Suite 公式ドキュメント](https://firebase.google.com/docs/emulator-suite)
- [Firestore セキュリティルール](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication エミュレーター](https://firebase.google.com/docs/emulator-suite/connect_auth)

---

## 🔄 次のステップ

1. **テストの自動化**: Jest と Firebase Emulator を統合（`npm run test:emulators`）
2. **CI/CD パイプライン**: GitHub Actions でエミュレーターを使用した自動テスト
3. **データのシード**: 開発用の初期データを自動投入

---

**作成者**: AI Agent  
**レビュー**: 未実施
