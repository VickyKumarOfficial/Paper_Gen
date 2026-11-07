import { NextRequest, NextResponse } from "next/server";
import { resolveCurriculum, UnsupportedCurriculumError, InvalidChapterIdError, CurriculumFileNotFoundError } from "@/lib/curriculum-resolver";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const classParam = searchParams.get("class");
  const subject = searchParams.get("subject");
  const chapterIdsParam = searchParams.get("chapterIds");

  if (!classParam || !subject) {
    return NextResponse.json(
      { error: "class and subject are required" },
      { status: 400 }
    );
  }

  const classLevel = parseInt(classParam, 10);
  if (isNaN(classLevel)) {
    return NextResponse.json(
      { error: "Invalid class parameter" },
      { status: 400 }
    );
  }

  const chapterIds = chapterIdsParam ? chapterIdsParam.split(",").filter(Boolean) : undefined;

  try {
    const curriculum = await resolveCurriculum({
      class: classLevel,
      subject,
      chapterIds,
    });
    return NextResponse.json({ curriculum });
  } catch (error) {
    if (error instanceof UnsupportedCurriculumError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    if (error instanceof InvalidChapterIdError) {
      return NextResponse.json(
        { error: error.message, invalidIds: error.invalidIds, validIds: error.validIds },
        { status: 400 }
      );
    }
    if (error instanceof CurriculumFileNotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    console.error("Failed to load curriculum:", error);
    return NextResponse.json(
      { error: "Failed to load curriculum" },
      { status: 500 }
    );
  }
}