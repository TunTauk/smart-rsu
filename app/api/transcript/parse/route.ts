import { type NextRequest, NextResponse } from "next/server";
import { extractCoursesFromPDF } from "@/lib/transcript/extract-courses";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const courses = await extractCoursesFromPDF(buffer);
    return NextResponse.json({ courses });
  } catch (err) {
    console.error("Transcript parse error:", err);
    return NextResponse.json({ error: "Failed to parse transcript" }, { status: 500 });
  }
}
