"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import SvgDiagram from "@/components/SvgDiagram";
import { GalResponse } from "@/lib/ai-service";

type CharacterState = "default" | "thinking" | "correct" | "surprised" | "troubled" | "sad";

const CHARACTER_IMAGES: Record<CharacterState, string> = {
  default:   "/characters/default.png",
  thinking:  "/characters/thinking.png",
  correct:   "/characters/correct.png",
  surprised: "/characters/surprised.png",
  troubled:  "/characters/troubled.png",
  sad:       "/characters/sad.png",
};

const CHARACTER_MESSAGES: Record<CharacterState, string> = {
  default:   "ムズい言葉を秒で例えてあげる💖",
  thinking:  "ちょっと待って、考えてるから！🤔",
  correct:   "わかった？これで完璧じゃん？！🎉",
  surprised: "え、そんな言葉知ってるの！？😲",
  troubled:  "ごめん、ちょっとわかんなかった😅",
  sad:       "うまく説明できなくてごめんね😢",
};

export default function GalTeacherPage() {
  const [word, setWord] = useState("");
  const [result, setResult] = useState<GalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [characterState, setCharacterState] = useState<CharacterState>("default");
  const [officeMode, setOfficeMode] = useState(true);

  // クライアントサイドでのみlocalStorageを読み込む
  useEffect(() => {
    const saved = localStorage.getItem("officeMode");
    // 未設定の場合はデフォルトでオフィスモード（true）
    setOfficeMode(saved === null ? true : saved === "true");
  }, []);

  const toggleOfficeMode = (value: boolean) => {
    setOfficeMode(value);
    localStorage.setItem("officeMode", String(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCharacterState("thinking");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: word }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `サーバーエラー (${res.status})`);
      }
      const data: GalResponse = await res.json();
      setResult(data);
      setCharacterState("correct");
    } catch (err) {
      setError(err instanceof Error ? err.message : "先生、今ちょっと取り込み中みたい！");
      setCharacterState("troubled");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWord(e.target.value);
    if (!loading && !result) {
      setCharacterState(e.target.value.length > 0 ? "surprised" : "default");
    }
  };

  // ===== オフィスモード =====
  if (officeMode) {
    return (
      <main className="min-h-screen bg-slate-50 pb-20">
        {/* ヘッダー */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">G</div>
            <span className="font-semibold text-slate-700 text-lg">GAL SENSEI</span>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">雰囲気解説</span>
          </div>
          <button
            onClick={() => toggleOfficeMode(false)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-all"
          >
            <span>🌸</span>
            <span>ギャルモード</span>
          </button>
        </div>

        {/* 検索フォーム */}
        <div className="max-w-2xl mx-auto mt-10 px-4">
          <p className="text-slate-500 text-sm mb-3 font-medium">調べたい用語を入力してください</p>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={word}
              onChange={handleInputChange}
              placeholder="例：Docker、スクラム、不動産登記..."
              className="flex-1 p-4 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-blue-400 text-base text-slate-700 bg-white placeholder-slate-400 shadow-sm"
            />
            <button
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base px-8 py-4 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? "検索中..." : "検索"}
            </button>
          </form>
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* 結果表示 */}
        {result && (
          <div className="max-w-2xl mx-auto mt-8 px-4">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
              <div className="bg-blue-500 px-6 py-4 text-white">
                <h2 className="text-xl font-semibold">{result.title}</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-blue-800 font-semibold text-base leading-tight">
                    {result.one_liner}
                  </p>
                </div>
                <div className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap">
                  {result.gal_explanation}
                </div>
                {result.comparison_table && (
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="p-3 font-semibold text-sm">項目</th>
                          <th className="p-3 font-semibold text-sm">{result.comparison_table.header_before}</th>
                          <th className="p-3 font-semibold text-sm text-blue-600">{result.comparison_table.header_after}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.comparison_table.rows.map((row, i) => (
                          <tr key={i}>
                            <td className="p-3 font-medium text-slate-600 bg-slate-50 w-1/4 text-sm">{row.item}</td>
                            <td className="p-3 text-slate-500 text-sm">{row.before}</td>
                            <td className="p-3 text-blue-600 font-medium text-sm">{row.after}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {result.diagram_svg && (
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-400 mb-3 text-center uppercase tracking-widest">
                      Visual Chart
                    </p>
                    <SvgDiagram svg={result.diagram_svg} />
                  </div>
                )}
                {result.caution && (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <p className="text-amber-700 text-sm font-medium">{result.caution}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // ===== ギャルモード（デフォルト）=====
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-500 via-rose-400 to-pink-200 pb-20">
      {/* モード切り替えトグル（右上固定） */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => toggleOfficeMode(true)}
          className="flex items-center gap-2 text-sm font-bold bg-white text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-full shadow-lg border border-slate-200 transition-all"
        >
          <span>💼</span>
          <span>オフィスモード</span>
        </button>
      </div>

      {/* ヘッダー */}
      <div className="text-white pt-8 px-4 text-center relative overflow-hidden">
        <h1 className="text-5xl font-extrabold mb-4 tracking-tighter italic drop-shadow-md">
          GAL SENSEI ✨
        </h1>
        <div className="flex flex-col items-center mt-1">
          <div className="mb-3 bg-white text-pink-600 font-bold text-sm px-5 py-2 rounded-2xl shadow-md relative">
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
            {CHARACTER_MESSAGES[characterState]}
          </div>
          <div className="relative w-64 h-80 md:w-80 md:h-96">
            <Image
              src={CHARACTER_IMAGES[characterState]}
              alt="ギャル先生"
              fill
              className="object-contain object-bottom transition-all duration-300"
              style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.25))" }}
              priority
            />
          </div>
        </div>
      </div>

      {/* 検索フォーム */}
      <div className="max-w-2xl mx-auto mt-6 px-4 relative z-10">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={word}
            onChange={handleInputChange}
            placeholder="知りたい言葉を入れてね（例：Docker）"
            className="flex-1 p-5 rounded-3xl border-4 border-pink-300 shadow-2xl focus:outline-none focus:border-pink-500 text-lg text-gray-700 bg-white placeholder-gray-400"
          />
          <button
            disabled={loading}
            className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-black text-xl px-10 py-4 rounded-3xl shadow-xl transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? "考え中..." : "教えて！"}
          </button>
        </form>
        {error && (
          <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-red-600 font-bold text-center">
            😭 {error}
          </div>
        )}
      </div>

      {/* 結果表示 */}
      {result && (
        <div className="max-w-2xl mx-auto mt-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-pink-200">
            <div className="bg-pink-500 p-5 text-white text-center">
              <h2 className="text-2xl font-bold">{result.title}</h2>
            </div>
            <div className="p-6 space-y-8">
              <div className="bg-yellow-50 border-l-8 border-yellow-400 p-5 rounded-r-xl">
                <p className="text-yellow-800 font-extrabold text-xl leading-tight">
                  {result.one_liner}
                </p>
              </div>
              <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap px-2">
                {result.gal_explanation}
              </div>
              {result.comparison_table && (
                <div className="overflow-hidden rounded-2xl border-2 border-pink-100 shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-pink-50 text-pink-600 border-b-2 border-pink-100">
                      <tr>
                        <th className="p-3 font-bold">項目</th>
                        <th className="p-3 font-bold">{result.comparison_table.header_before}</th>
                        <th className="p-3 font-bold text-pink-700">{result.comparison_table.header_after}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                      {result.comparison_table.rows.map((row, i) => (
                        <tr key={i}>
                          <td className="p-3 font-bold text-gray-600 bg-gray-50 w-1/4">{row.item}</td>
                          <td className="p-3 text-gray-500 text-sm">{row.before}</td>
                          <td className="p-3 text-pink-600 font-bold">{row.after}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {result.diagram_svg && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <p className="text-sm font-bold text-gray-400 mb-4 text-center uppercase tracking-widest">
                    🎨 Visual Chart
                  </p>
                  <SvgDiagram svg={result.diagram_svg} />
                </div>
              )}
              {result.caution && (
                <div className="bg-red-50 p-5 rounded-2xl border-2 border-red-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-400"></div>
                  <p className="text-red-700 font-bold text-sm">{result.caution}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}