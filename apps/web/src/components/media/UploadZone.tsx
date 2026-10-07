"use client";

import { useCallback, useRef, useState } from "react";

type FileInfo = {
  file: File;
  width?: number;
  height?: number;
};

export function UploadZone({
  accept,
  onFile,
}: {
  accept: string;
  onFile: (info: FileInfo) => void;
}) {
  const [info, setInfo] = useState<FileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    async (file: File) => {
      setError(null);
      const payload: FileInfo = { file };
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        const image = new Image();
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject();
          image.src = url;
        });
        payload.width = image.naturalWidth;
        payload.height = image.naturalHeight;
        URL.revokeObjectURL(url);
      }
      setInfo(payload);
      onFile(payload);
    },
    [onFile],
  );

  return (
    <div
      className="border border-dashed border-border bg-surface px-24 py-32 text-center hover:border-border-strong"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) void handle(file);
      }}
      onPaste={(event) => {
        const file = event.clipboardData.files[0];
        if (file) void handle(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handle(file);
        }}
      />
      <p className="text-[15px] text-text">Drop a file, click to browse, or paste from the clipboard.</p>
      <p className="mt-8 text-[14px] text-text-muted">Filenames are not trusted. PixelForge inspects type and contents on the worker.</p>
      <button
        type="button"
        className="mt-16 min-h-44 border border-border px-16 text-[15px] hover:border-border-strong"
        onClick={() => inputRef.current?.click()}
      >
        Browse
      </button>
      {info ? (
        <p className="mt-16 font-mono text-[12px] text-text-muted">
          {info.file.name} · {(info.file.size / (1024 * 1024)).toFixed(2)} MB
          {info.width && info.height ? ` · ${info.width}×${info.height}` : ""} · {info.file.type || "unknown type"}
        </p>
      ) : null}
      {error ? <p className="mt-12 text-[14px] text-danger">{error}</p> : null}
    </div>
  );
}
