"use client";

import { useState, useTransition } from "react";

import Avatar from "@/components/Avatar";

type ProfileFormProps = {
  initialName: string;
  initialImageData: string | null;
};

export default function ProfileForm({ initialName, initialImageData }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [profileImageData, setProfileImageData] = useState<string | null>(initialImageData);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setProfileImageData(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="panel max-w-3xl p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <Avatar imageData={profileImageData} name={name || initialName} size="lg" />
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Profile</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Update display details</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Upload a profile image and keep your team identity polished on both player and coach surfaces.
          </p>
        </div>
      </div>

      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          setMessage("");

          startTransition(async () => {
            try {
              const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, profileImageData })
              });

              const data = await response.json();

              if (!response.ok) {
                setError(data.error || "Unable to update profile.");
                return;
              }

              setMessage("Profile updated.");
            } catch (requestError) {
              console.error("Profile update failed", requestError);
              setError("Unable to update profile.");
            }
          });
        }}
      >
        <div>
          <label className="label" htmlFor="profile-name">
            Display Name
          </label>
          <input
            className="field"
            id="profile-name"
            onChange={(event) => setName(event.target.value)}
            type="text"
            value={name}
          />
        </div>

        <div>
          <label className="label" htmlFor="profile-image">
            Profile Image
          </label>
          <input
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="field pt-3"
            id="profile-image"
            onChange={handleImageChange}
            type="file"
          />
        </div>

        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}

        <button className="btn-primary" disabled={isPending} type="submit">
          {isPending ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
