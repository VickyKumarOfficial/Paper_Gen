import { NextRequest, NextResponse } from "next/server";
import { loadQuestions, UnsupportedEditionError, FixtureFileNotFoundError, QuestionValidationError } from "@/lib/question-bank";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const curriculumEdition = searchParams.get("curriculumEdition");
  const chapterIdsParam = searchParams.get("chapterIds");

  if (!curriculumEdition) {
    return NextResponse.json(
      { error: "curriculumEdition is required" },
      { status: 400 }
    );
  }

  const chapterIds = chapterIdsParam ? chapterIdsParam.split(",").filter(Boolean) : undefined;

  try {
    const questions = await loadQuestions(curriculumEdition, chapterIds);
    return NextResponse.json({ questions });
  } catch (error) {
    if (error instanceof UnsupportedEditionError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    if (error instanceof FixtureFileNotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    if (error instanceof QuestionValidationError) {
      return NextResponse.json(
        { error: error.message, questionIndex: error.questionIndex },
        { status: 500 }
      );
    }
    console.error("Failed to load questions:", error);
    return NextResponse.json(
      { error: "Failed to load questions" },
      { status: 500 }
    );
  }
}