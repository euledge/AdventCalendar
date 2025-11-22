# Phase 1 実装タスクリスト（本番運用準備）

**作成日**: 2025年11月21日  
**期限**: 本番運用前（必須）  
**関連ドキュメント**: [コードレビュー報告書](./code_review_20251121.md)

---

## 📋 タスク概要

| カテゴリ | タスク数 | 合計時間 | 完了 |
|---------|---------|---------|------|
| 🔴 Critical | 5件 | 約2時間 | 5/5 |
| 🟡 High | 4件 | 約4時間 | 0/4 |
| 🟢 Medium | 5件 | 約4時間 | 0/5 |
| **合計** | **14件** | **約10時間** | **5/14** |

---

## 🔴 Critical Tasks（本番前に必須）

### Task 1: 未来日チェックの有効化

- [x] **タスク完了**
- **ファイル**: `src/components/CalendarDay.tsx`
- **行番号**: Line 16
- **作業時間**: 5分
- **優先度**: 最優先

**変更内容**:
```typescript
// Before (Line 16)
const isFuture = false; // targetDate > today;

// After
const today = new Date();
const targetDate = new Date(2025, 11, day); // December is month 11
const isFuture = targetDate > today;
```

**検証方法**:
1. 開発サーバーを起動
2. 未来の日付をクリック
3. 「この日付はまだ利用できません」と表示されることを確認

**注意事項**:
- この変更により、テスト時は12月1日以降でないと登録できなくなります
- 開発時にテストが必要な場合は、日付を調整してください

---

### Task 2: 環境変数の検証機能追加

- [x] **タスク完了**
- **ファイル**: `src/lib/firebase.ts`
- **行番号**: Line 5-15（新規追加）
- **作業時間**: 15分
- **優先度**: 高

**変更内容**:
```typescript
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate required environment variables
const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
];

const missingVars = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
);

if (missingVars.length > 0) {
    throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env.local file.'
    );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
```

**検証方法**:
1. `.env.local` の一部の変数を削除
2. `npm run dev` を実行
3. エラーメッセージが表示されることを確認
4. 変数を元に戻して正常に起動することを確認

---

### Task 3: 認証エラーハンドリングの追加

- [x] **タスク完了**
- **ファイル**: `src/contexts/AuthContext.tsx`
- **行番号**: Line 57-65
- **作業時間**: 20分
- **優先度**: 高

**変更内容**:
1. `sonner` の `toast` をインポート
2. `signInWithGoogle` にエラーハンドリング追加
3. `signInWithGithub` にエラーハンドリング追加

**実装コード**:
```typescript
import { toast } from 'sonner';

const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (error: any) {
        console.error('Google sign-in error:', error);
        if (error.code === 'auth/popup-closed-by-user') {
            toast.error('ログインがキャンセルされました');
        } else if (error.code === 'auth/popup-blocked') {
            toast.error('ポップアップがブロックされました。ブラウザの設定を確認してください');
        } else {
            toast.error('ログインに失敗しました。もう一度お試しください');
        }
    }
};

const signInWithGithub = async () => {
    try {
        const provider = new GithubAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (error: any) {
        console.error('GitHub sign-in error:', error);
        if (error.code === 'auth/popup-closed-by-user') {
            toast.error('ログインがキャンセルされました');
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            toast.error('このメールアドレスは既に別の認証方法で登録されています');
        } else {
            toast.error('ログインに失敗しました。もう一度お試しください');
        }
    }
};
```

**検証方法**:
1. ログインダイアログを開く
2. Googleログインをクリック後、ポップアップを閉じる
3. トーストメッセージが表示されることを確認
4. 各種エラーケースをテスト

---

### Task 4: Firestore セキュリティルールの実装

- [x] **タスク完了**
- **場所**: Firebase Console
- **作業時間**: 30分（テスト含む）
- **優先度**: 高

**実装手順**:
1. Firebase Console にアクセス
2. Firestore Database → Rules タブを開く
3. 以下のルールを設定

**セキュリティルール**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Entries collection rules
    match /entries/{docId} {
      // Allow anyone to read entries
      allow read: if true;
      
      // Allow authenticated users to create entries only for valid dates
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.day >= 1
        && request.resource.data.day <= 25
        && request.resource.data.year == 2025  // Update this each year
        && request.resource.data.title is string
        && request.resource.data.title.size() > 0
        && request.resource.data.title.size() <= 200
        && request.resource.data.url is string
        && request.resource.data.url.matches('https?://.*')
        && request.resource.data.url.size() <= 2000
        && docId == request.resource.data.year + '-' + request.resource.data.day;
      
      // Allow users to update only their own entries
      allow update: if request.auth != null
        && request.auth.uid == resource.data.userId
        && request.resource.data.userId == resource.data.userId  // Prevent userId change
        && request.resource.data.day == resource.data.day  // Prevent day change
        && request.resource.data.year == resource.data.year;  // Prevent year change
      
      // Allow users to delete only their own entries
      allow delete: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

**検証方法**:
1. Firebase Console の Rules Playground でテスト
2. 認証なしでの書き込みを試行（失敗するはず）
3. 不正なデータ（day=26など）での書き込みを試行（失敗するはず）
4. 正常なデータでの書き込みを試行（成功するはず）

**テストケース**:
- [ ] 未認証ユーザーが読み取りできることを確認
- [ ] 未認証ユーザーが書き込みできないことを確認
- [ ] day=0 が拒否されることを確認
- [ ] day=26 が拒否されることを確認
- [ ] title が200文字を超えると拒否されることを確認
- [ ] http:// または https:// 以外のURLが拒否されることを確認
- [ ] 他のユーザーのエントリーを編集できないことを確認

---

### Task 5: エントリー登録時の競合処理実装

- [x] **タスク完了**
- **ファイル**: `src/components/EntryDialog.tsx`
- **行番号**: Line 50-71
- **作業時間**: 30分
- **優先度**: 高

**変更内容**:
1. `runTransaction` をインポート
2. `setDoc` を `runTransaction` に置き換え
3. エラーハンドリングを改善

**実装コード**:
```typescript
import { doc, setDoc, Timestamp, runTransaction } from 'firebase/firestore';

// handleSubmit 関数内（Line 50-71を置き換え）
try {
    const docId = `${year}-${day}`;
    const docRef = doc(db, 'entries', docId);
    
    await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(docRef);
        
        // 既存エントリーがあり、かつ自分のものでない場合はエラー
        if (docSnap.exists() && docSnap.data().userId !== user.uid) {
            throw new Error('この日付は既に他のユーザーによって登録されています');
        }
        
        transaction.set(docRef, {
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            userPhotoURL: user.photoURL,
            day,
            year,
            title,
            url,
            comment: comment || null,
            createdAt: Timestamp.now(),
        });
    });
    
    toast.success(existingEntry ? 'エントリーを更新しました' : 'エントリーを登録しました');
    onSuccess();
} catch (error: any) {
    console.error('Error saving entry:', error);
    if (error.message.includes('既に他のユーザー')) {
        toast.error(error.message);
    } else {
        toast.error('保存に失敗しました。もう一度お試しください');
    }
} finally {
    setLoading(false);
}
```

**検証方法**:
1. 2つのブラウザで同じユーザーとしてログイン
2. 同時に同じ日付に登録を試行
3. 片方がエラーメッセージを受け取ることを確認

---

## 🟡 High Priority Tasks（1週間以内）

### Task 6: リアルタイム更新の実装

- [ ] **タスク完了**
- **ファイル**: `src/components/CalendarGrid.tsx`
- **行番号**: Line 17-19, 21-53
- **作業時間**: 30分
- **優先度**: 中

**変更内容**:
1. `onSnapshot` をインポート
2. `loadEntries` 関数を削除
3. `useEffect` 内で `onSnapshot` を使用

**実装コード**:
```typescript
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';

// useEffect内（Line 17-19を置き換え）
useEffect(() => {
    const q = query(
        collection(db, 'entries'),
        where('year', '==', CURRENT_YEAR)
    );
    
    const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
            const entriesMap = new Map<number, Entry>();
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const entry: Entry = {
                    id: doc.id,
                    userId: data.userId,
                    userName: data.userName,
                    userPhotoURL: data.userPhotoURL,
                    day: data.day,
                    year: data.year,
                    title: data.title,
                    url: data.url,
                    comment: data.comment,
                    createdAt: (data.createdAt as Timestamp).toDate(),
                };
                entriesMap.set(entry.day, entry);
            });
            setEntries(entriesMap);
            setLoading(false);
        },
        (error) => {
            console.error('Error loading entries:', error);
            toast.error('カレンダーの読み込みに失敗しました');
            setLoading(false);
        }
    );
    
    return unsubscribe;
}, []);

// loadEntries 関数を削除（Line 21-53）
// handleEntryCreated 関数も簡素化（loadEntries呼び出しを削除）
const handleEntryCreated = () => {
    setSelectedDay(null);
    // リアルタイムリスナーが自動で更新するため、loadEntries()は不要
};
```

**検証方法**:
1. 2つのブラウザを開く
2. 片方で記事を登録
3. もう片方で自動的に反映されることを確認

---

### Task 7: URL検証の強化

- [ ] **タスク完了**
- **ファイル**: `src/components/EntryDialog.tsx`
- **行番号**: Line 40-46
- **作業時間**: 15分
- **優先度**: 中

**変更内容**:
```typescript
// Validate URL (Line 40-46を置き換え)
if (!url.trim()) {
    toast.error('URLを入力してください');
    return;
}

try {
    const parsedUrl = new URL(url);
    // Allow only http/https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        toast.error('HTTPまたはHTTPSのURLを入力してください');
        return;
    }
} catch {
    toast.error('有効なURLを入力してください（例: https://example.com/article）');
    return;
}
```

**検証方法**:
1. 空のURLで登録を試行
2. `javascript:alert(1)` で登録を試行（拒否されるはず）
3. `ftp://example.com` で登録を試行（拒否されるはず）
4. `https://example.com` で登録を試行（成功するはず）

---

### Task 8: README.md の更新

- [ ] **タスク完了**
- **ファイル**: `README.md`
- **行番号**: 全体
- **作業時間**: 20分
- **優先度**: 中

**変更内容**: 現在のViteテンプレートの内容を、プロジェクト固有の内容に置き換え

**新しい内容** (コードレビュー報告書のSection 8を参照):
- プロジェクト概要
- 機能一覧
- セットアップ手順
- 技術スタック
- ドキュメントリンク

---

### Task 9: エラー監視ツール（Sentry）の導入

- [ ] **タスク完了**
- **対象**: プロジェクト全体
- **作業時間**: 1時間
- **優先度**: 中

**実装手順**:
1. Sentryアカウント作成（無料プラン）
2. プロジェクト作成
3. SDKインストール: `npm install @sentry/react`
4. 環境変数追加: `.env.example` に `VITE_SENTRY_DSN` を追加
5. 初期化コード追加

**実装コード**:
```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

// 本番環境のみ有効化
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        environment: import.meta.env.MODE,
    });
}
```

**検証方法**:
1. わざとエラーを発生させる
2. Sentryダッシュボードでエラーが記録されることを確認

---

### Task 14: デザイン刷新と日本語化

- [x] **タスク完了**
- **対象**: 全体
- **作業時間**: 1時間
- **優先度**: 高

**変更内容**:
1. **日本語化**: 全UIテキストを日本語に翻訳
2. **デザイン**: ロゴに合わせた配色（`#f6eedb`, `#BA3627`）とレイアウト変更
3. **カレンダー**: 赤いボード風のデザインに変更

---

## 🟢 Medium Priority Tasks（2週間以内）

### Task 10: パフォーマンス最適化

- [ ] **タスク完了 - コード分割**
- [ ] **タスク完了 - Firestoreインデックス**
- **作業時間**: 2〜3時間
- **優先度**: 低

#### 10-1: EntryDialog のコード分割

**ファイル**: `src/components/CalendarGrid.tsx`

```typescript
import { lazy, Suspense } from 'react';

const EntryDialog = lazy(() => import('./EntryDialog'));

// 使用箇所（Line 90-98）
{selectedDay && (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
        <EntryDialog
            day={selectedDay}
            year={CURRENT_YEAR}
            existingEntry={entries.get(selectedDay)}
            onClose={() => setSelectedDay(null)}
            onSuccess={handleEntryCreated}
        />
    </Suspense>
)}
```

#### 10-2: Firestore インデックスの作成

**ファイル**: `firestore.indexes.json`（新規作成）

```json
{
  "indexes": [
    {
      "collectionGroup": "entries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "year", "order": "ASCENDING" },
        { "fieldPath": "day", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**Firebase Console で設定**:
1. Firestore → Indexes タブ
2. Composite タブ
3. "Create Index" をクリック
4. Collection: `entries`
5. Fields: `year` (Ascending), `day` (Ascending)

---

### Task 11: 未使用依存関係の削除

- [ ] **タスク完了**
- **ファイル**: `package.json`
- **作業時間**: 5分
- **優先度**: 低

**実行コマンド**:
```bash
npm uninstall next-themes
```

**注意**: Phase 3 でダークモード実装時に再インストール

---

### Task 12: 複数年対応の設計検討

- [ ] **タスク完了 - 設計ドキュメント作成**
- **成果物**: `docs/decisions/adr-001-multiple-year-support.md`
- **作業時間**: 30分（設計のみ、実装はPhase 3）
- **優先度**: 低

**検討内容**:
1. URL方式の設計（`?year=2025`）
2. データ構造の変更有無
3. UI/UXの考慮事項
4. 移行計画

---

### Task 13: クリックハンドラーのリファクタリング

- [ ] **タスク完了**
- **ファイル**: `src/components/CalendarDay.tsx`
- **行番号**: Line 18-26
- **作業時間**: 10分
- **優先度**: 低

**変更内容**:
```typescript
// Before (Line 18-26)
const handleClick = () => {
    if (entry) {
        window.open(entry.url, '_blank', 'noopener,noreferrer');
    } else if (!isFuture && isAuthenticated) {
        onDayClick(day);
    }
};

// After（早期リターンでネストを削減）
const handleClick = () => {
    // Case 1: Already has entry - open external link
    if (entry) {
        window.open(entry.url, '_blank', 'noopener,noreferrer');
        return;
    }
    
    // Case 2: Future date - do nothing
    if (isFuture) {
        return;
    }
    
    // Case 3: Not authenticated - do nothing
    if (!isAuthenticated) {
        return;
    }
    
    // Case 4: Available for registration
    onDayClick(day);
};
```

---

## 📊 進捗トラッキング

### 完了チェックリスト

#### Week 1（Critical Tasks）
- [x] Task 1: 未来日チェック有効化
- [x] Task 2: 環境変数検証
- [x] Task 3: 認証エラーハンドリング
- [x] Task 4: Firestoreセキュリティルール
- [x] Task 5: 競合処理実装

#### Week 2（High Priority Tasks）
- [ ] Task 6: リアルタイム更新
- [ ] Task 7: URL検証強化
- [ ] Task 8: README更新
- [x] Task 9: Sentry導入 (不要)
- [x] Task 14: デザイン刷新と日本語化

#### Week 3-4（Medium Priority Tasks）
- [ ] Task 10-1: コード分割
- [ ] Task 10-2: Firestoreインデックス
- [ ] Task 11: 未使用依存関係削除
- [ ] Task 12: 複数年対応設計
- [ ] Task 13: リファクタリング

---

## 🎯 マイルストーン

### Milestone 1: 本番運用可能状態
**期限**: Critical Tasks完了後
**条件**:
- [ ] Task 1-5 がすべて完了
- [ ] すべての検証テストが通過
- [ ] Firestore セキュリティルールが適用済み

### Milestone 2: UX改善完了
**期限**: Week 2終了時
**条件**:
- [ ] Task 6-9 がすべて完了
- [ ] エラー監視が稼働中
- [ ] リアルタイム更新が動作

### Milestone 3: Phase 1 完了
**期限**: Week 4終了時
**条件**:
- [ ] 全13タスクが完了
- [ ] ドキュメントが最新状態
- [ ] Phase 2 の計画策定完了

---

## 📝 備考

### 開発環境
- Node.js: 18以上
- npm: 最新版推奨
- Firebase CLI: インストール推奨（`npm install -g firebase-tools`）

### テスト方法
各タスク完了後、以下を確認:
1. `npm run dev` でローカル起動
2. `npm run build` でビルド成功
3. `npm run lint` でリントエラーなし
4. 機能テスト（各タスクの「検証方法」参照）

### コミット規約
AGENTS.mdの規約に従ってコミット:
- 形式: `🔧 fix: タスク名`（Critical）
- 形式: `✨ feat: タスク名`（High/Medium）

**例**:
```
🔧 fix: 未来日チェックを有効化

CalendarDay.tsx の isFuture フラグをテスト用の固定値から
実際の日付比較に変更しました。

これにより、12月1日より前の日付には登録できなくなります。
```

---

**次回レビュー**: Task 1-5 完了後  
**担当者**: [担当者名を記入]  
**作成者**: AI Agent
