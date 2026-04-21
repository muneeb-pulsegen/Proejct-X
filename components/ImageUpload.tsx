"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload() {
  const router = useRouter();
  const [injuryTitle, setInjuryTitle] = useState("");
  const [bodyArea, setBodyArea] = useState("");
  const [painLevel, setPainLevel] = useState("5");
  const [notes, setNotes] = useState("");
  const [injuryPreview, setInjuryPreview] = useState("");
  const [injuryFileName, setInjuryFileName] = useState("");
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handlePrimaryFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setInjuryPreview("");
      setInjuryFileName("");
      return;
    }

    if (!file.type.startsWith("image/") || file.size > MAX_FILE_SIZE) {
      setError("Please upload a valid injury image under 4 MB.");
      return;
    }

    setError("");
    setInjuryFileName(file.name);
    setInjuryPreview(await fileToDataUrl(file));
  };

  const handleExtraFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    try {
      const validFiles = files.filter((file) => file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE);
      const images = await Promise.all(validFiles.map(fileToDataUrl));
      setExtraImages(images.slice(0, 3));
    } catch {
      setError("Unable to process the extra images.");
    }
  };

  return (
    <div className="panel overflow-hidden">
      <form
        className="grid gap-8 p-6 sm:p-8"
        onSubmit={(event) => {
          event.preventDefault();

          if (!injuryPreview || !injuryTitle || !bodyArea) {
            setError("Please complete the report details and upload the injury image.");
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
                  injuryImageData: injuryPreview,
                  extraImages,
                  injuryTitle,
                  bodyArea,
                  painLevel: Number(painLevel),
                  notes
                })
              });

              const data = await response.json();

              if (!response.ok) {
                setError(data.error || "Unable to analyze the report.");
                return;
              }

              router.push(`/result?id=${data.reportId}`);
              router.refresh();
            } catch (requestError) {
              console.error("Analyze request failed", requestError);
              setError("Unable to send the injury report right now.");
            }
          });
        }}
      >
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Injury report</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Submit a player injury</h2>
          <p className="text-sm leading-6 text-slate-600">
            Include the main injury image plus a few basics so coaches can see the full context.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="injury-title">
              Injury Title
            </label>
            <input
              className="field"
              id="injury-title"
              onChange={(event) => setInjuryTitle(event.target.value)}
              placeholder="Lower leg abrasion"
              type="text"
              value={injuryTitle}
            />
          </div>
          <div>
            <label className="label" htmlFor="body-area">
              Body Area
            </label>
            <input
              className="field"
              id="body-area"
              onChange={(event) => setBodyArea(event.target.value)}
              placeholder="Right ankle"
              type="text"
              value={bodyArea}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="pain-level">
              Pain Level
            </label>
            <input
              className="field"
              id="pain-level"
              max="10"
              min="1"
              onChange={(event) => setPainLevel(event.target.value)}
              type="number"
              value={painLevel}
            />
          </div>
          <div>
            <label className="label" htmlFor="extra-images">
              Extra Images
            </label>
            <input
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="field pt-3"
              id="extra-images"
              multiple
              onChange={handleExtraFiles}
              type="file"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="notes">
            Notes
          </label>
          <textarea
            className="min-h-28 w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            id="notes"
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Describe symptoms, training impact, or anything the coach should know."
            value={notes}
          />
        </div>

        <label
          className={`group flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed px-6 py-8 text-center transition ${
            injuryPreview
              ? "border-sky-200 bg-sky-50/60"
              : "border-slate-300 bg-white/90 hover:border-blue-300 hover:bg-blue-50/40"
          }`}
          htmlFor="injury-image"
        >
          <input
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="sr-only"
            id="injury-image"
            onChange={handlePrimaryFile}
            type="file"
          />

          {injuryPreview ? (
            <div className="w-full space-y-4">
              <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-sm">
                <img alt="Injury preview" className="h-[320px] w-full object-cover" src={injuryPreview} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">{injuryFileName}</p>
                <p className="text-sm text-slate-500">{extraImages.length} supporting image(s) added</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl text-blue-700 transition group-hover:bg-blue-100">
                +
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-950">Drop in the primary injury image</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                Choose the clearest image you have. Add extra views above if needed.
              </p>
            </>
          )}
        </label>

        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Your coach will see this report once it is submitted.</p>
          <button className="btn-primary min-w-[180px]" disabled={isPending} type="submit">
            {isPending ? "Analyzing..." : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
}
