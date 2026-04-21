import { NextRequest, NextResponse } from "next/server";

import { getAuthPayloadFromRequest } from "@/lib/auth";
import {
  createAnalysis,
  findAnalysisByIdForUser,
  type AnalysisResult
} from "@/lib/db";

const MOCK_ANALYSES: AnalysisResult[] = [
  {
    wound_type: "Diabetic Ulcer",
    severity: "Moderate",
    healing_time: "2-4 weeks",
    confidence: 0.87,
    suggestions: ["Clean wound daily", "Apply dressing", "Monitor redness and drainage"]
  },
  {
    wound_type: "Pressure Sore",
    severity: "Mild",
    healing_time: "1-2 weeks",
    confidence: 0.81,
    suggestions: ["Relieve pressure often", "Keep skin dry", "Use a protective barrier cream"]
  },
  {
    wound_type: "Venous Leg Ulcer",
    severity: "Moderate",
    healing_time: "3-6 weeks",
    confidence: 0.84,
    suggestions: ["Elevate the limb", "Maintain clean compression dressing", "Seek clinician follow-up"]
  }
];

function isAllowedImage(imageData: string) {
  return /^data:image\/(png|jpeg|jpg|webp);base64,/.test(imageData);
}

function mockAnalysis(imageData: string) {
  let hash = 0;

  for (let index = 0; index < imageData.length; index += 47) {
    hash = (hash + imageData.charCodeAt(index) * (index + 1)) % 10000;
  }

  return MOCK_ANALYSES[hash % MOCK_ANALYSES.length];
}

export async function POST(request: NextRequest) {
  try {
    const session = getAuthPayloadFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const imageData = typeof body.imageData === "string" ? body.imageData : "";

    if (!imageData || !isAllowedImage(imageData)) {
      return NextResponse.json(
        { error: "Please upload a PNG, JPG, or WEBP image." },
        { status: 400 }
      );
    }

    if (imageData.length > 6_000_000) {
      return NextResponse.json(
        { error: "Image is too large. Please keep uploads under 4 MB." },
        { status: 400 }
      );
    }

    const result = mockAnalysis(imageData);
    const analysis = await createAnalysis({
      userId: session.sub,
      imageData,
      result
    });

    return NextResponse.json({
      analysisId: analysis.id,
      ...analysis.result
    });
  } catch (error) {
    console.error("Analysis failed", error);
    return NextResponse.json({ error: "Unable to analyze the image right now." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = getAuthPayloadFromRequest(request);

    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const analysisId = request.nextUrl.searchParams.get("id");

    if (!analysisId) {
      return NextResponse.json({ error: "Analysis id is required." }, { status: 400 });
    }

    const analysis = await findAnalysisByIdForUser(analysisId, session.sub);

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis lookup failed", error);
    return NextResponse.json({ error: "Unable to load the analysis." }, { status: 500 });
  }
}
