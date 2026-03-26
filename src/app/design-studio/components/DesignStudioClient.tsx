"use client";

import DesignStudioInteractive from "./DesignStudioInteractive";

export default function DesignStudioClient() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="grid-overlay">
        <div className="grid-inner">
          {[...Array(4)]?.map((_, i) => (
            <div key={i} className="grid-line-v" />
          ))}
        </div>
      </div>
        <DesignStudioInteractive />
    </div>
  );
}
