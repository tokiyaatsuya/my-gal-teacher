"use client";

import DOMPurify from "dompurify";

interface Props {
    svg: string | null;
}

export default function SvgDiagram({ svg }: Props) {
    if (!svg) return null;

    // AIがたまに```で囲んで返すケースのクリーニング
    const cleanSvg = svg
        .replace(/```svg|```xml|```/g, "")
        .trim();

    // <svg タグで始まっていない場合は壊れたレスポンスとして無視
    if (!cleanSvg.startsWith("<svg")) return null;

    const safeSvg = DOMPurify.sanitize(cleanSvg, {
        USE_PROFILES: { svg: true, svgFilters: true },
        FORBID_TAGS: ["script", "use"],
        FORBID_ATTR: ["onload", "onerror", "onclick", "href"],
    });

    return (
        <div className="flex justify-center w-full bg-white rounded-xl p-4 overflow-x-auto">
            <div
                className="w-full"
                dangerouslySetInnerHTML={{ __html: safeSvg }}
            />
        </div>
    );
}