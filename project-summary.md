# 📝 Project Summary: SHIRO-GAL SENSEI ✨

難しい専門用語を「白ギャル」が超分かりやすく例え話で解説し、さらに図解（Mermaid.js）まで提供する「爆速理解エンジン」の開発プロジェクト。

## 1. プロジェクト概要
- **コンセプト:** 「結局、〇〇ってなんなん？💖」をテーマに、IT・不動産・法律などの難解な概念をギャル語と身近な例え話で噛み砕く。
- **主要機能:**
    - ギャル風の超例え話解説（例え話生成エンジン）
    - 一言サマリー（キャッチコピー）
    - 比較テーブルによる「ビフォー・アフター」の可視化
    - Mermaid.jsによる動的な図解（ビジュアルチャート）生成

## 2. 使用技術スタック
- **Runtime:** Node.js v24.14.0
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **AI SDK:** @google/genai (v1.x)
- **LLM:** Gemini 3 Flash (gemini-3-flash-preview)
- **Styling:** Tailwind CSS (ピンク/イエロー基調のギャルUI)
- **Diagrams:** Mermaid.js (ユニークID生成による動的レンダリング)

## 3. 決定事項・アーキテクチャ設計
- **サービス層の分離:** `src/lib/ai-service.ts` を作成し、UIとAIロジックを分離。環境変数 `AI_PROVIDER` により、将来的なプロバイダー切り替え（OpenAI等）に対応。
- **プロンプトエンジニアリング:** JSONフォーマットを厳密に定義。「解説・要約・図解・比較表・注意点」の5要素を1つのプロンプトで生成。
- **レンダリング安定化:** Mermaid.jsの描画バグ対策として、`mermaid.render` を用いてSVGを直接生成し、`dangerouslySetInnerHTML` で流し込む手法を採用。

## 4. 環境設定 (.env.local)
```
GEMINI_API_KEY=取得したAPIキー
AI_PROVIDER=gemini
```

## 5. 現在の進捗
- [x] Node.js 環境構築（v24へアップデート）
- [x] Gemini API 連携（最新SDK導入）
- [x] バックエンド API Route 実装
- [x] フロントエンド UI 実装（レイアウト最適化済み）
- [x] Mermaid.js 図解描画の安定化（SVGレンダリング方式）

## 6. 今後の課題 (Next Steps)
- 白ギャル先生のキャラクタービジュアル（アイコン）の生成と配置。
- 知識管理リポジトリ（GitHub life_work）との連携。
- 入力情報の履歴保存機能。