'use client';

import { useState } from 'react';

const subjects: Record<string, string[]> = {
  '11': ['Physics', 'Chemistry', 'Mathematics'],
  '12': ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
};

const sections = [
  { label: 'A', name: 'Multiple choice', count: 10, marks: 1 },
  { label: 'B', name: 'Short answer', count: 5, marks: 2 },
  { label: 'C', name: 'Numerical', count: 5, marks: 2 },
  { label: 'D', name: 'Long answer', count: 2, marks: 5 },
];
const questionCount = sections.reduce((sum, section) => sum + section.count, 0);
const totalMarks = sections.reduce((sum, section) => sum + section.count * section.marks, 0);

function Icon({ name }: { name: 'spark' | 'arrow' | 'book' | 'clock' | 'file' | 'reset' }) {
  const shapes = {
    spark: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/><path d="m19 17 .6 1.4L21 19l-1.4.6L19 21l-.6-1.4L17 19l1.4-.6L19 17Z"/></>,
    arrow: <><path d="M4 12h16"/><path d="m14 6 6 6-6 6"/></>,
    book: <><path d="M12 6.5C9.5 4.8 6.8 4.5 3 5v13c3.8-.5 6.5-.2 9 1.5 2.5-1.7 5.2-2 9-1.5V5c-3.8-.5-6.5-.2-9 1.5Z"/><path d="M12 6.5v13"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    file: <><path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h4M9 12h6M9 16h6"/></>,
    reset: <><path d="M3 11a9 9 0 1 1 2.3 6"/><path d="M3 4v7h7"/></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>;
}

export default function GeneratePaperPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [draft, setDraft] = useState<{ className: string; subject: string } | null>(null);

  const canGenerate = Boolean(selectedClass && selectedSubject);

  return <div className="app-shell">
    <header className="topbar"><div className="topbar-inner"><div className="brand"><span className="brand-mark"><Icon name="spark" /></span><span>Niera <span className="brand-divider">/</span> <span className="brand-subtitle">Paper Studio</span></span></div><span className="topbar-tag">Practice paper builder</span></div></header>
    <main className="workspace">
      <nav className="breadcrumb" aria-label="Breadcrumb">Practice <span>›</span> Question papers <span>›</span> <strong>{draft ? 'Draft preview' : 'Create new'}</strong></nav>
      <div className="page-heading"><div><h1>{draft ? 'Your paper outline is ready.' : 'Build a better practice session.'}</h1><p>{draft ? 'Review the paper settings below. Question content is not connected in this prototype.' : 'Choose a class and subject to start. Review the sample paper settings before you continue.'}</p></div><div className="heading-art" aria-hidden="true"><div className="art-sheet back"/><div className="art-sheet front"><span/><span/><span/><i/></div></div></div>
      <div className="content-grid">
        <section className="main-panel" aria-labelledby="panel-heading"><div className="panel-header"><span className="step-badge">{draft ? '02' : '01'}</span><div><h2 id="panel-heading">{draft ? 'Paper outline' : 'Start with the essentials'}</h2><p>{draft ? 'A snapshot of your selected settings' : 'Two choices are all you need to begin'}</p></div></div>
          {draft ? <div className="panel-body"><div className="preview-title"><span className="preview-icon"><Icon name="file"/></span><div><small>PRACTICE PAPER</small><h3>Class {draft.className} {draft.subject}</h3><p>CBSE sample · Full subject · Draft outline</p></div></div><div className="preview-metrics"><div><strong>{questionCount}</strong><span>Questions</span></div><div><strong>{totalMarks}</strong><span>Total marks</span></div><div><strong>60<small> min</small></strong><span>Suggested time</span></div></div><div className="section-heading"><h4>Section breakdown</h4><span>Sample template</span></div><div className="section-list">{sections.map(section => <div className="section-row" key={section.label}><span className="section-letter">{section.label}</span><strong>{section.name}</strong><span>{section.count} × {section.marks} mark{section.marks > 1 ? 's' : ''}</span><b>{section.count * section.marks}</b></div>)}</div><div className="notice"><Icon name="book"/><p><strong>Questions are not available yet.</strong> This preview shows the sample paper structure only. Question selection and generation are still to be built.</p></div><button className="text-button" type="button" onClick={() => setDraft(null)}><Icon name="reset"/> Change selection</button></div> : <div className="panel-body"><div className="form-intro"><Icon name="book"/><div><strong>What would you like to practise?</strong><span>We’ll use the full subject by default.</span></div></div><div className="field-grid"><div className="field"><label htmlFor="class-select">Class <span>*</span></label><div className="select-wrap"><select id="class-select" value={selectedClass} onChange={event => { setSelectedClass(event.target.value); setSelectedSubject(''); }}><option value="">Select your class</option>{Object.keys(subjects).map(className => <option key={className} value={className}>Class {className}</option>)}</select></div><small>Choose your current grade</small></div><div className="field"><label htmlFor="subject-select">Subject <span>*</span></label><div className="select-wrap"><select id="subject-select" value={selectedSubject} disabled={!selectedClass} onChange={event => setSelectedSubject(event.target.value)}><option value="">{selectedClass ? 'Select a subject' : 'Choose a class first'}</option>{selectedClass && subjects[selectedClass].map(subject => <option key={subject} value={subject}>{subject}</option>)}</select></div><small>Subjects depend on your class</small></div></div><div className="selection-note"><span>✓</span>No chapter selection needed. Your paper will cover the full subject.</div><div className="form-footer"><p>Review the sample settings before continuing.</p><button className="primary-button" type="button" disabled={!canGenerate} onClick={() => setDraft({ className: selectedClass, subject: selectedSubject })}>Generate outline <Icon name="arrow"/></button></div></div>}
        </section>
        <aside className="side-column" aria-label="Paper settings"><section className="summary-card"><div className="summary-top"><span><Icon name="file"/></span> YOUR PAPER AT A GLANCE</div><h2>Default paper settings</h2><p>A sample structure for your practice paper. Final settings will depend on the supported curriculum.</p><hr/><div className="summary-line"><span>Curriculum</span><strong>CBSE (sample)</strong></div><div className="summary-line"><span>Subject</span><strong>{selectedSubject || 'Choose a subject'}</strong></div><div className="summary-line"><span>Coverage</span><strong>Full subject</strong></div><hr/><div className="summary-stats"><div><Icon name="book"/><strong>{questionCount}</strong><span>Questions</span></div><div><span className="stat-check">✓</span><strong>{totalMarks}</strong><span>Marks</span></div><div><Icon name="clock"/><strong>60</strong><span>Minutes</span></div></div></section><section className="help-card"><Icon name="spark"/><div><h3>Keep it simple</h3><p>Start with a class and subject. Chapter filters and custom settings are planned for a later stage.</p></div></section></aside>
      </div><footer className="page-footer"><span>NIERA PAPER STUDIO</span><span>Made for focused practice</span></footer>
    </main>
  </div>;
}
