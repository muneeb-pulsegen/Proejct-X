import { NextRequest, NextResponse } from "next/server";

import { createMockAnalysis, isAllowedImage } from "@/lib/analysis";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { createInjuryReport, findUserById } from "@/lib/db";

const MAX_IMAGE_LENGTH = 6_000_000;

function sanitizeExtraImages(images: unknown) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.filter((image): image is string => typeof image === "string");
}

export async function POST(request: NextRequest) {
  try {
    const session = getAuthPayloadFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    if (session.role !== "player") {
      return NextResponse.json({ error: "Only players can submit injury reports." }, { status: 403 });
    }

    const body = await request.json();
    const injuryImageData = typeof body.injuryImageData === "string" ? body.injuryImageData : "";
    const extraImages = sanitizeExtraImages(body.extraImages);
    const injuryTitle = typeof body.injuryTitle === "string" ? body.injuryTitle.trim() : "";
    const bodyArea = typeof body.bodyArea === "string" ? body.bodyArea.trim() : "";
    const painLevel = Number(body.painLevel);
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    if (!injuryImageData || !isAllowedImage(injuryImageData)) {
      return NextResponse.json(
        { error: "Please upload a PNG, JPG, or WEBP injury image." },
        { status: 400 }
      );
    }

    if (
      injuryImageData.length > MAX_IMAGE_LENGTH ||
      extraImages.some((image) => image.length > MAX_IMAGE_LENGTH || !isAllowedImage(image))
    ) {
      return NextResponse.json(
        { error: "Images are too large or invalid. Keep each one under 4 MB." },
        { status: 400 }
      );
    }

    if (!injuryTitle || !bodyArea || Number.isNaN(painLevel) || painLevel < 1 || painLevel > 10) {
      return NextResponse.json(
        { error: "Please complete the injury title, body area, and pain level." },
        { status: 400 }
      );
    }

    const player = await findUserById(session.sub);

    if (!player) {
      return NextResponse.json({ error: "Player account not found." }, { status: 404 });
    }

    const analysis = createMockAnalysis({
      injuryImageData,
      bodyArea,
      painLevel,
      notes,
      injuryTitle
    });

    const report = await createInjuryReport({
      playerUserId: player.id,
      teamId: player.teamId,
      injuryImageData,
      extraImages,
      injuryTitle,
      bodyArea,
      painLevel,
      notes,
      analysis
    });

    return NextResponse.json({
      reportId: report.id,
      analysis: report.analysis
    });
  } catch (error) {
    console.error("Analysis failed", error);
    return NextResponse.json({ error: "Unable to analyze the image right now." }, { status: 500 });
  }
}
