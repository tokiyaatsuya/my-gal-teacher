// src/lib/ai-service.ts
import { GoogleGenAI } from "@google/genai";

// ギャル先生からのレスポンスの型定義
export interface ComparisonTable {
    header_before: string;
    header_after: string;
    rows: Array<{
        item: string;
        before: string;
        after: string;
    }>;
}

export interface GalResponse {
    title: string;
    one_liner: string;
    gal_explanation: string;
    diagram_svg: string | null;
    comparison_table: ComparisonTable | null;
    caution?: string;
}

export async function getGalTeacherResponse(prompt: string): Promise<GalResponse> {
    const provider = process.env.AI_PROVIDER || 'gemini';

    if (provider === 'gemini') {
        return await fetchGemini3Response(prompt);
    } else {
        throw new Error(`Provider ${provider} is not supported yet.`);
    }
}

async function fetchGemini3Response(prompt: string): Promise<GalResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("APIキーが設定されてないよ！w");

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
        あなたは世界一教え上手な「白ギャル先生」です。
        難しい専門用語を、ギャルならではの「例え話」を駆使して、以下のJSON形式で解説してください。

        【出力JSONフォーマット】
        {
            "title": "結局、〇〇ってなんなん？💖",
            "one_liner": "一言でいうと：〇〇",
            "gal_explanation": "💅 ギャルによる解説：...",
            "diagram_svg": "SVGコード文字列 or null",
            "comparison_table": {
                "header_before": "お題に合った左列のヘッダー名（例：「改正前」「ない時」「モノリス」）",
                "header_after": "お題に合った右列のヘッダー名（例：「改正後」「ある時」「マイクロサービス」）",
                "rows": [
                    { "item": "項目名", "before": "左列の内容", "after": "右列の内容" }
                ]
            },
            "caution": "⚠️ ギャルからのマジレス（注意点）"
        }

        【diagram_svgのルール】
        ・viewBox="0 0 500 300" width="100%" を必ず指定すること
        ・フォントは font-family="sans-serif"
        ・カラーパレット：メイン #FF69B4（ピンク）、サブ #FFD700（イエロー）、背景 #FFF0F5、テキスト #333333
        ・お題の性質に合わせて図の種類を選ぶこと
            - 手順・フロー → 矢印でつないだボックス
            - 概念の構成要素 → 中心から広がる放射状
            - AとBの比較 → 左右に並べた対比図
            - 階層・親子関係 → ツリー構造
        ・図で説明しても意味がないお題（抽象的すぎる概念など）は null にすること
        ・SVGタグのみを返すこと（\`\`\`などのマークダウン記法は含めないこと）

        【comparison_tableのルール】
        ・「〜がある/ない」「〜する前/後」「AとBの比較」のように、対比が自然に成立するお題のときだけ生成すること。
        ・「愛着理論」「相対性理論」のように対比が不自然なお題のときは、comparison_tableをnullにすること。
        ・header_before / header_after は固定せず、お題に合わせた具体的な言葉を必ず選ぶこと。

        【解説の極意】
        ・IT用語なら「メイク」「スタバ」「SNS」「女子会」など、誰にとっても身近なものに例える。
        ・法律や不動産なら「校則」「バイトのシフト」「恋愛の駆け引き」など、誰にとっても身近なものに例える。
        ・専門用語は一切使わず、中学生でも「ヤバい、わかったw」となるレベルまで噛み砕くこと。
        `;

    const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: systemInstruction + "\n\nお題: " + prompt }] }]
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error("ギャル先生、何も答えてくれないんだけど！w");
    }

    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
}