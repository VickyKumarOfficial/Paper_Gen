'use client';

import { useState, useEffect } from 'react';
import { Chapter, Question, Difficulty } from '@/lib/contracts';
import ChapterPicker from '@/components/ChapterPicker';

// Phase 0 Support Matrix: Only CBSE Class 11 Physics is approved
// Edition: cbse-2026-27-phy-042-xi (14 chapters)
// Source: docs/phase0-decisions.md section 1
const supportMatrix = {
  classes: {
    '11': {
      classDisplayName: 'Class 11',
      subjects: {
        'Physics': {
          displayName: 'Physics',
          curriculumEdition: 'cbse-2026-27-phy-042-xi',
          board: 'CBSE',
          templateType: 'FULL_SUBJECT',
          questionCount: 30,
          totalMarks: 30,
          durationMinutes: 60,
        },
      },
    },
  },
} as const;

// Template sections for FULL_SUBJECT (CBSE Class 11 Physics)
// Source: data/templates/cbse-2026-27-phy-042-xi.templates.json
const sections = [
  { label: 'A', name: 'Multiple choice', count: 30, marks: 1 },
];
const questionCount = sections.reduce((sum, section) => sum + section.count, 0);
const totalMarks = sections.reduce((sum, section) => sum + section.count * section.marks, 0);

function Icon({ name, className }: { name: 'spark' | 'arrow' | 'book' | 'clock' | 'file' | 'reset' | 'alert' | 'check' | 'loader'; className?: string }) {
  const shapes = {
    spark: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/><path d="m19 17 .6 1.4L21 19l-1.4.6L19 21l-.6-1.4L17 19l1.4-.6L19 17Z"/></>,
    arrow: <><path d="M4 12h16"/><path d="m14 6 6 6-6 6"/></>,
    book: <><path d="M12 6.5C9.5 4.8 6.8 4.5 3 5v13c3.8-.5 6.5-.2 9 1.5 2.5-1.7 5.2-2 9-1.5V5c-3.8-.5-6.5-.2-9 1.5Z"/><path d="M12 6.5v13"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    file: <><path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h4M9 12h6M9 16h6"/></>,
    reset: <><path d="M3 11a9 9 0 1 1 2.3 6"/><path d="M3 4v7h7"/></>,
    alert: <><circle cx="12" cy="12" r="9"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
    check: <><path d="M20 6 9 17l-5-5"/></>,
    loader: <><path d="M12 2v4"/><path d="m16.2 7.8 2.9 2.9"/><path d="M22 12h-4"/><path d="m16.2 16.2 2.9-2.9"/><path d="M12 18v4"/><path d="m7.8 16.2-2.9-2.9"/><path d="M2 12h4"/><path d="m7.8 7.8-2.9 2.9"/></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>{shapes[name]}</svg>;
}

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const colors = {
    EASY: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    HARD: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
}

function QuestionCard({ question, index }: { question: Question; index: number }) {
  // Extract stem from either FullQuestion (content.stem) or SimplifiedQuestion (stem)
  const stem = 'content' in question ? question.content.stem : question.stem;
  const marks = question.marks;
  const difficulty = question.difficulty;
  const chapterId = 'curriculum' in question ? question.curriculum?.chapterId : question.chapterId;
  const chapterName = 'curriculum' in question ? question.curriculum?.chapterName : undefined;
  const chapterNumber = 'curriculum' in question ? question.curriculum?.chapterNumber : undefined;

  // Truncate stem to first 100 chars
  const displayStem = stem.length > 100 ? stem.substring(0, 100) + '…' : stem;

  return (
    <div className="question-card">
      <div className="question-header">
        <span className="question-number">Q{index + 1}</span>
        <div className="question-meta">
          <DifficultyBadge difficulty={difficulty} />
          <span className="question-marks">{marks} mark{marks > 1 ? 's' : ''}</span>
        </div>
      </div>
      <p className="question-stem">{displayStem}</p>
      {(chapterName || chapterNumber) && (
        <div className="question-chapter">
          <Icon name="book" className="w-3 h-3" />
          <span>
            {chapterName ? `Chapter ${chapterNumber}: ${chapterName}` : `Chapter ${chapterNumber}`}
          </span>
        </div>
      )}
    </div>
  );
}

export default function GeneratePaperPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [draft, setDraft] = useState<{ className: string; subject: string; curriculumEdition: string } | null>(null);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [curriculumChapters, setCurriculumChapters] = useState<Chapter[]>([]);
  const [curriculumUnits, setCurriculumUnits] = useState<Array<{ unitId: string; unitNumber: number; unitRoman: string; unitName: string }>>([]);
  const [loading, setLoading] = useState(false);
  
  // Question bank state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const canGenerate = Boolean(selectedClass && selectedSubject);
  
  // Get the data for the selected combination
  const classData = selectedClass ? (supportMatrix.classes as Record<string, any>)[selectedClass] : null;
  const subjectData = selectedClass && selectedSubject && classData 
    ? (classData.subjects as Record<string, any>)[selectedSubject] 
    : null;

  // Load curriculum when class/subject changes
  useEffect(() => {
    if (!selectedClass || !selectedSubject) {
      setCurriculumChapters([]);
      setSelectedChapterIds([]);
      setLoading(false);
      return;
    }

    // Reset chapter selection when class/subject changes
    setSelectedChapterIds([]);

    const loadCurriculum = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("class", selectedClass);
        params.set("subject", selectedSubject);
        const response = await fetch(`/api/curriculum?${params.toString()}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to load curriculum");
        }
        
        setCurriculumChapters(data.curriculum?.chapters || []);
        setCurriculumUnits(data.curriculum?.units || []);
      } catch (error) {
        console.error('Failed to load curriculum:', error);
        setCurriculumChapters([]);
        setCurriculumUnits([]);
      } finally {
        setLoading(false);
      }
    };

    loadCurriculum();
  }, [selectedClass, selectedSubject]);

  // Load questions when draft is created
  useEffect(() => {
    if (!draft) {
      setQuestions([]);
      setQuestionsError(null);
      return;
    }

    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      setQuestionsError(null);
      try {
        const params = new URLSearchParams();
        params.set("curriculumEdition", draft.curriculumEdition);
        if (selectedChapterIds.length > 0) {
          params.set("chapterIds", selectedChapterIds.join(","));
        }
        const response = await fetch(`/api/questions?${params.toString()}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to load questions");
        }
        
        setQuestions(data.questions || []);
      } catch (error) {
        console.error('Failed to load questions:', error);
        if (error instanceof Error) {
          setQuestionsError(error.message);
        } else {
          setQuestionsError('Failed to load questions');
        }
        setQuestions([]);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [draft, selectedChapterIds, draft?.curriculumEdition]);

  // Compute the display scope
  const scopeText = (): string => {
    if (!selectedClass || !selectedSubject) {
      return 'Full subject';
    }
    if (loading) {
      return 'Loading...';
    }
    if (selectedChapterIds.length === 0) {
      return 'Full subject';
    }
    
    const selectedChapters = curriculumChapters.filter((c) => selectedChapterIds.includes(c.chapterId));
    if (selectedChapters.length === 0) {
      return 'Full subject';
    }
    
    if (selectedChapters.length === 1) {
      const ch = selectedChapters[0];
      return `Chapter ${ch.chapterNumber}: ${ch.chapterName}`;
    }
    
    if (selectedChapters.length <= 3) {
      return selectedChapters
        .sort((a, b) => a.chapterNumber - b.chapterNumber)
        .map((ch) => `Chapter ${ch.chapterNumber}: ${ch.chapterName}`)
        .join(', ');
    }
    
    // For more than 3, show count
    return `${selectedChapters.length} chapters selected`;
  };

  // Check if we have enough questions for the template
  const hasEnoughQuestions = questions.length >= questionCount;
  const questionsShortfall = questionCount - questions.length;

  return <div className="app-shell">
    <header className="topbar"><div className="topbar-inner"><div className="brand"><span className="brand-mark"><Icon name="spark" /></span><span>Niera <span className="brand-divider">/</span> <span className="brand-subtitle">Paper Studio</span></span></div><span className="topbar-tag">Practice paper builder</span></div></header>
    <main className="workspace">
      <nav className="breadcrumb" aria-label="Breadcrumb">Practice <span>›</span> Question papers <span>›</span> <strong>{draft ? 'Draft preview' : 'Create new'}</strong></nav>
      <div className="page-heading"><div><h1>{draft ? 'Your paper outline is ready.' : 'Build a better practice session.'}</h1><p>{draft ? 'Review the paper settings and questions below.' : 'Choose a class and subject to start. Review the sample paper settings before you continue.'}</p></div><div className="heading-art" aria-hidden="true"><div className="art-sheet back"/><div className="art-sheet front"><span/><span/><span/><i/></div></div></div>
      <div className="content-grid">
        <section className="main-panel" aria-labelledby="panel-heading"><div className="panel-header"><span className="step-badge">{draft ? '02' : '01'}</span><div><h2 id="panel-heading">{draft ? 'Paper outline' : 'Start with the essentials'}</h2><p>{draft ? 'A snapshot of your selected settings and available questions' : 'Two choices are all you need to begin'}</p></div></div>
          {draft ? <div className="panel-body">
            <div className="preview-title"><span className="preview-icon"><Icon name="file"/></span><div><small>PRACTICE PAPER</small><h3>Class {draft.className} {draft.subject}</h3><p>{subjectData?.curriculumEdition} · CBSE sample · {scopeText()} · Draft outline</p></div></div>
            <div className="preview-metrics">
              <div><strong>{questions.length || questionCount}</strong><span>Questions</span></div>
              <div><strong>{subjectData?.totalMarks || totalMarks}</strong><span>Total marks</span></div>
              <div><strong>{subjectData?.durationMinutes || 60}<small> min</small></strong><span>Suggested time</span></div>
            </div>
            <div className="section-heading"><h4>Section breakdown</h4><span>Sample template</span></div>
            <div className="section-list">{sections.map(section => <div className="section-row" key={section.label}><span className="section-letter">{section.label}</span><strong>{section.name}</strong><span>{section.count} × {section.marks} mark{section.marks > 1 ? 's' : ''}</span><b>{section.count * section.marks}</b></div>)}</div>
            
            {/* Questions loading/error state */}
            {loadingQuestions && (
              <div className="notice loading">
                <Icon name="loader" className="animate-spin" />
                <p>Loading questions from fixture...</p>
              </div>
            )}
            
            {questionsError && (
              <div className="notice error">
                <Icon name="alert" />
                <p><strong>Failed to load questions:</strong> {questionsError}</p>
              </div>
            )}
            
            {/* Questions preview */}
            {questions.length > 0 && !loadingQuestions && (
              <>
                <div className="section-heading">
                  <h4>Available questions ({questions.length})</h4>
                  <span>From fixture</span>
                </div>
                <div className="questions-preview">
                  {questions.slice(0, 10).map((q, i) => (
                    <QuestionCard key={q.stableId} question={q} index={i} />
                  ))}
                  {questions.length > 10 && (
                    <div className="questions-more">
                      <p>... and {questions.length - 10} more questions</p>
                    </div>
                  )}
                </div>
                {!hasEnoughQuestions && (
                  <div className="notice warning">
                    <Icon name="alert" />
                    <p><strong>Insufficient questions:</strong> Template requires {questionCount} questions but only {questions.length} available (shortfall: {questionsShortfall}).</p>
                  </div>
                )}
                {hasEnoughQuestions && questions.length > 0 && (
                  <div className="notice success">
                    <Icon name="check" />
                    <p><strong>Ready to generate:</strong> {questions.length} questions available for {questionCount} required slots.</p>
                  </div>
                )}
              </>
            )}
            
            {questions.length === 0 && !loadingQuestions && !questionsError && (
              <div className="notice">
                <Icon name="book"/>
                <p><strong>No questions available.</strong> Check that fixtures exist for the selected curriculum and chapters.</p>
              </div>
            )}
            
            <button className="text-button" type="button" onClick={() => setDraft(null)}><Icon name="reset"/> Change selection</button>
          </div> : <div className="panel-body"><div className="form-intro"><Icon name="book"/><div><strong>What would you like to practise?</strong><span>We'll use the full subject by default.</span></div></div><div className="field-grid"><div className="field"><label htmlFor="class-select">Class <span>*</span></label><div className="select-wrap"><select id="class-select" value={selectedClass} onChange={event => { setSelectedClass(event.target.value); setSelectedSubject(''); setSelectedChapterIds([]); setCurriculumChapters([]); setCurriculumUnits([]); }}><option value="">Select your class</option>{Object.entries(supportMatrix.classes).map(([classKey, classInfo]) => (<option key={classKey} value={classKey}>{classInfo.classDisplayName}</option>))}</select><svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></div></div><div className="field"><label htmlFor="subject-select">Subject <span>*</span></label><div className="select-wrap"><select id="subject-select" value={selectedSubject} onChange={event => { setSelectedSubject(event.target.value); setSelectedChapterIds([]); }} disabled={!selectedClass}><option value="">Select a subject</option>{selectedClass && classData && Object.entries(classData.subjects).map(([subjectKey, subjectInfo]) => (<option key={subjectKey} value={subjectKey}>{(subjectInfo as any).displayName}</option>))}</select><svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></div></div></div>
            {selectedClass && selectedSubject && (
              <div className="chapter-picker-section">
                <div className="form-intro">
                  <Icon name="book"/>
                  <div>
                    <strong>Choose chapters to include</strong>
                    <span>Selecting specific chapters filters your paper scope. Leave all unchecked for full subject.</span>
                  </div>
                </div>
                <ChapterPicker
                  chapters={curriculumChapters}
                  units={curriculumUnits}
                  selectedChapterIds={selectedChapterIds}
                  onChange={setSelectedChapterIds}
                  disabled={loading}
                />
                {loading && (
                  <div className="chapter-picker-loading">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading curriculum...</p>
                  </div>
                )}
              </div>
            )}
            <div className="selection-note"><span>✓</span><span>{scopeText()}</span></div>
            <div className="form-footer"><p>Review the sample settings before continuing.</p><button className="primary-button" type="button" disabled={!canGenerate} onClick={() => setDraft({ className: selectedClass, subject: selectedSubject, curriculumEdition: subjectData?.curriculumEdition || '' })}>Generate outline <Icon name="arrow"/></button></div></div>}
        </section>
        <aside className="side-column" aria-label="Paper settings"><section className="summary-card"><div className="summary-top"><span><Icon name="file"/></span> YOUR PAPER AT A GLANCE</div><h2>Default paper settings</h2><p>A sample structure for your practice paper. Final settings will depend on the supported curriculum.</p><hr/><div className="summary-line"><span>Curriculum</span><strong>{subjectData?.curriculumEdition || 'Select class and subject'}</strong></div><div className="summary-line"><span>Subject</span><strong>{selectedSubject || 'Choose a subject'}</strong></div><div className="summary-line"><span>Coverage</span><strong>{scopeText()}</strong></div><hr/><div className="summary-stats"><div><Icon name="book"/><strong>{questions.length > 0 ? questions.length : (subjectData?.questionCount || questionCount)}</strong><span>Questions</span></div><div><span className="stat-check">✓</span><strong>{subjectData?.totalMarks || totalMarks}</strong><span>Marks</span></div><div><Icon name="clock"/><strong>{subjectData?.durationMinutes || 60}</strong><span>Minutes</span></div></div></section><section className="help-card"><Icon name="spark"/><div><h3>Keep it simple</h3><p>Start with a class and subject. Chapter filters and custom settings are planned for a later stage.</p></div></section></aside>
      </div>
      <footer className="page-footer"><span>NIERA PAPER STUDIO</span><span>Made for focused practice</span></footer>
    </main>
  </div>;
}