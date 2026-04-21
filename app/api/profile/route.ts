import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentUser,
  sessionFromUser,
  setAuthCookie,
  signAuthToken,
  validateName
} from "@/lib/auth";
import { updateUserProfile } from "@/lib/db";

export async function PATCH(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { name, profileImageData } = await request.json();

    if (!validateName(name)) {
      return NextResponse.json({ error: "Please provide a valid display name." }, { status: 400 });
    }

    if (
      profileImageData !== null &&
      !(typeof profileImageData === "string" && profileImageData.startsWith("data:image/"))
    ) {
      return NextResponse.json({ error: "Profile image must be a valid image." }, { status: 400 });
    }

    const user = await updateUserProfile({
      userId: currentUser.id,
      name: name.trim(),
      profileImageData
    });

    if (!user) {
      return NextResponse.json({ error: "Unable to update profile." }, { status: 404 });
    }

    const response = NextResponse.json({ user });
    setAuthCookie(response, signAuthToken(sessionFromUser(user)));
    return response;
  } catch (error) {
    console.error("Profile update failed", error);
    return NextResponse.json({ error: "Unable to update profile." }, { status: 500 });
  }
}
