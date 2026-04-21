"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

export default function ImageUpload() {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const hasPreview = Boolean(preview);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    setError("");

    if (!selectedFile) {
      setPreview("");
      setFileName("");
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("Please keep uploads under 4 MB.");
      return;
    }

    setFileName(selectedFile.name);

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setPreview(result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!preview) {
      setError("Please upload an image before requesting analysis.");
      return;
    }

    setError("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            imageData: preview,
            fileName
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "Unable to analyze the image.");
          return;
        }

        router.push(`/result?id=${data.analysisId}`);
        router.refresh();
      } catch (requestError) {
        console.error("Analyze request failed", requestError);
        setError("Unable to send the image right now. Please try again.");
      }
    });
  };

  return (
    <div className="panel overflow-hidden">
      <form className="grid gap-8 p-6 sm:p-8" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Image intake
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Upload and review</h2>
          <p className="text-sm leading-6 text-slate-600">
            PNG, JPG, or WEBP files are supported. The image preview stays visible before you submit.
          </p>
        </div>

        <label
          className={`group flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed px-6 py-8 text-center transition ${
            hasPreview
              ? "border-sky-200 bg-sky-50/60"
              : "border-slate-300 bg-white/90 hover:border-blue-300 hover:bg-blue-50/40"
          }`}
          htmlFor="wound-image"
        >
          <input
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="sr-only"
            id="wound-image"
            onChange={handleFileChange}
            type="file"
          />

          {hasPreview ? (
            <div className="w-full space-y-4">
              <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-sm">
                <img
                  alt="Wound preview"
                  className="h-[320px] w-full object-cover"
                  src={preview}
                />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">{fileName}</p>
                <p className="text-sm text-slate-500">Preview ready for analysis</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-700 transition group-hover:bg-blue-100">
                +
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-950">Drop in a wound image</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                Choose a single clear image to generate a structured mock analysis response.
              </p>
            </>
          )}
        </label>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Your upload stays attached to your authenticated session.
          </p>
          <button className="btn-primary min-w-[180px]" disabled={isPending} type="submit">
            {isPending ? "Analyzing..." : "Analyze Image"}
          </button>
        </div>
      </form>
    </div>
  );
}
