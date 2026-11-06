'use client';

import { useState } from 'react';

// Phase 1 mock data (verified fixtures from generated/sample-fixtures)
const availableSubjects: Record<number, string[]> = {
  11: ['Physics', 'Chemistry', 'Mathematics'],
  12: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
};

// Sample blueprint for verified fixture: Class 11 Physics
const sampleBlueprint = {
  sections: [
    { label: 'Section A', instructions: 'Multiple Choice Questions (1 mark each)', questions: 10 },
    { label: 'Section B', instructions: 'Short Answer Questions (2 marks each)', questions: 5 },
    { label: 'Section C', instructions: 'Numerical Questions (3 marks each)', questions: 3 },
    { label: 'Section D', instructions: 'Long Answer Questions (5 marks each)', questions: 2 },
  ],
  totalMarks: 40,
  durationMinutes: 60,
};

export default function GeneratePaperPage() {
  const [selectedClass, setSelectedClass] = useState<number | ''>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [generatedPaper, setGeneratedPaper] = useState<any>(null);

  const handleGenerate = async () => {
    // Phase 1: Mock generation from fixture data (no AI)
    const mockPaper = {
      id: 'draft_' + Date.now(),
      class: selectedClass,
      subject: selectedSubject,
      chapterScope: 'Full Subject',
      blueprintSummary: {
        totalQuestions: sampleBlueprint.sections.reduce((a, s) => a + s.questions, 0),
        totalMarks: sampleBlueprint.totalMarks,
        duration: sampleBlueprint.durationMinutes,
      },
      questions: [], // Will be filled from verified fixtures later
    };
    setGeneratedPaper(mockPaper);
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Niera Question Paper Generator</h1>

      {!generatedPaper ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(Number(e.target.value));
                setSelectedSubject('');
              }}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Select Class --</option>
              {Object.keys(availableSubjects).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {selectedClass && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Select Subject --</option>
                {availableSubjects[selectedClass].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!selectedClass || !selectedSubject}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Generate Paper
          </button>

          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h2 className="font-semibold mb-2">Default Summary (Preview)</h2>
            <p className="text-sm">Curriculum: CBSE • Subject: {selectedSubject || '—'}</p>
            <p className="text-sm">Duration: {sampleBlueprint.durationMinutes} min • Marks: {sampleBlueprint.totalMarks}</p>
            <p className="text-sm">Questions: {sampleBlueprint.sections.reduce((a, s) => a + s.questions, 0)} (from full syllabus)</p>
          </div>
        </>
      ) : (
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Paper Preview</h2>
          <p><strong>Class:</strong> {generatedPaper.class}</p>
          <p><strong>Subject:</strong> {generatedPaper.subject}</p>
          <p><strong>Scope:</strong> {generatedPaper.chapterScope}</p>
          <p><strong>Total Marks:</strong> {generatedPaper.blueprintSummary.totalMarks}</p>
          <p><strong>Questions:</strong> {generatedPaper.blueprintSummary.totalQuestions}</p>
          {/* Phase 5: Paper preview with actual questions from fixture goes here */}
        </div>
      )}
    </main>
  );
}