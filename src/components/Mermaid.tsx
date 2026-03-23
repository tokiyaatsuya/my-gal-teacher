"use client";
import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

// 初期設定はコンポーネントの外で一回だけ
if (typeof window !== "undefined") {
    mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
            primaryColor: "#FF69B4",
            edgeLabelBackground: "#ffffff",
            tertiaryColor: "#f9f9f9",
        },
        securityLevel: "loose",
    });
}

export default function Mermaid({ chart }: { chart: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState("");

    useEffect(() => {
        const renderChart = async () => {
            if (!chart || !ref.current) return;

            // 1. AIが返してきたコードを掃除
            const cleanChart = chart.trim().replace(/\\n/g, "\n");

            try {
                // 2. ユニークなIDを生成して、古いキャッシュを無効化する
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
            
                // 3. mermaid.render を直接叩いてSVG（画像データ）を生成する
                const { svg: svgCode } = await mermaid.render(id, cleanChart);
            
                // 4. 生成されたSVGをステートに保存して画面に反映
                setSvg(svgCode);
            } catch (error) {
                console.error("Mermaid描画エラー:", error);
                // エラー時は生のテキストを出してデバッグしやすくする
                setSvg(`<pre class="text-xs text-red-400">${cleanChart}</pre>`);
            }
        };

        renderChart();
    }, [chart]);

    // dangerouslySetInnerHTML を使って、生成されたSVGを直接流し込む
    return (
        <div className="flex justify-center w-full bg-white rounded-xl p-4 overflow-x-auto">
            <div 
                ref={ref}
                className="mermaid"
                dangerouslySetInnerHTML={{ __html: svg }}
            />
        </div>
    );
}