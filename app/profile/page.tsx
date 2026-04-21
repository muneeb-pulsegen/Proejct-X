import ProfileForm from "@/components/ProfileForm";
import { requireCurrentUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await requireCurrentUser();

  return (
    <section className="py-8">
      <div className="mb-8 space-y-3">
        <span className="eyebrow">Account settings</span>
        <h1 className="section-title">Profile details for your {user.role} account.</h1>
        <p className="section-copy">
          Keep your display name and profile image current so teammates and coaches can recognize the right person quickly.
        </p>
      </div>

      <ProfileForm initialImageData={user.profileImageData} initialName={user.name} />
    </section>
  );
}
