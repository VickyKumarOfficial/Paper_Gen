'use client';

import { Chapter } from '@/lib/contracts';

interface UnitInfo {
  unitId: string;
  unitNumber: number;
  unitRoman: string;
  unitName: string;
}

interface ChapterPickerProps {
  chapters: Chapter[];
  selectedChapterIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  units?: UnitInfo[];
}

export default function ChapterPicker({
  chapters,
  selectedChapterIds,
  onChange,
  disabled = false,
  units = [],
}: ChapterPickerProps) {
  // Build unit map for lookup
  const unitMap: Record<string, UnitInfo> = {};
  
  if (units.length > 0) {
    units.forEach((unit) => {
      unitMap[unit.unitId] = unit;
    });
  } else {
    // Fallback: derive unit info from chapters using hard-coded mapping
    const fallbackUnitNames: Record<number, string> = {
      1: 'Physical World and Measurement',
      2: 'Kinematics',
      3: 'Laws of Motion',
      4: 'Work, Energy and Power',
      5: 'Motion of System of Particles and Rigid Body',
      6: 'Gravitation',
      7: 'Properties of Bulk Matter',
      8: 'Thermodynamics',
      9: 'Behaviour of Perfect Gases and Kinetic Theory of Gases',
      10: 'Oscillations and Waves',
    };
    
    chapters.forEach((chapter) => {
      const unitId = chapter.unitId;
      if (!unitMap[unitId]) {
        unitMap[unitId] = {
          unitId,
          unitNumber: chapter.unitNumber,
          unitRoman: getRomanNumeral(chapter.unitNumber),
          unitName: fallbackUnitNames[chapter.unitNumber] || `Unit ${chapter.unitNumber}`,
        };
      }
    });
  }

  // Group chapters by unit
  const chaptersByUnit: Array<{
    unit: UnitInfo;
    chapters: Chapter[];
  }> = [];

  const processedUnitIds = new Set<string>();

  chapters.forEach((chapter) => {
    if (processedUnitIds.has(chapter.unitId)) return;

    // Get all chapters for this unit
    const unitChapters = chapters.filter((c) => c.unitId === chapter.unitId);
    
    const unitInfo = unitMap[chapter.unitId];
    if (unitInfo) {
      chaptersByUnit.push({
        unit: unitInfo,
        chapters: unitChapters,
      });
    }

    processedUnitIds.add(chapter.unitId);
  });

  // Sort by unit number
  chaptersByUnit.sort((a, b) => a.unit.unitNumber - b.unit.unitNumber);

  const totalChapters = chapters.length;
  const selectedCount = selectedChapterIds.length;

  const handleSelectAll = () => {
    if (disabled) return;
    const allIds = chapters.map((c) => c.chapterId);
    onChange(allIds);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const handleToggle = (chapterId: string) => {
    if (disabled) return;
    const isSelected = selectedChapterIds.includes(chapterId);
    if (isSelected) {
      onChange(selectedChapterIds.filter((id) => id !== chapterId));
    } else {
      onChange([...selectedChapterIds, chapterId]);
    }
  };

  const formatChapterDisplay = (chapter: Chapter): string => {
    return `Chapter ${chapter.chapterNumber}: ${chapter.chapterName}`;
  };

  if (totalChapters === 0) {
    return (
      <div className="chapter-picker-empty">
        <p className="text-sm text-gray-500 dark:text-gray-400">No chapters available</p>
      </div>
    );
  }

  return (
    <div className="chapter-picker">
      {/* Header with Select All / Clear All buttons and count */}
      <div className="chapter-picker-header">
        <div className="chapter-picker-actions">
          <button
            type="button"
            className="text-button"
            onClick={handleSelectAll}
            disabled={disabled}
          >
            Select All
          </button>
          <button
            type="button"
            className="text-button"
            onClick={handleClearAll}
            disabled={disabled}
          >
            Clear All
          </button>
        </div>
        <div className="chapter-picker-count">
          {selectedCount} of {totalChapters} chapters selected
        </div>
      </div>

      {/* Chapters grouped by unit */}
      <div className="chapter-list">
        {chaptersByUnit.map(({ unit, chapters: unitChapters }) => (
          <div key={unit.unitId} className="chapter-unit">
            {/* Unit header */}
            <div className="chapter-unit-header">
              <span className="chapter-unit-roman">{unit.unitRoman}.</span>
              <span className="chapter-unit-name">{unit.unitName}</span>
            </div>

            {/* Chapters in this unit */}
            <div className="chapter-checklist">
              {unitChapters
                .sort((a, b) => a.chapterNumber - b.chapterNumber)
                .map((chapter) => {
                  const isSelected = selectedChapterIds.includes(chapter.chapterId);
                  return (
                    <label
                      key={chapter.chapterId}
                      className={`chapter-item ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggle(chapter.chapterId)}
                        disabled={disabled}
                        className="chapter-checkbox"
                      />
                      <span className="chapter-label">{formatChapterDisplay(chapter)}</span>
                    </label>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getRomanNumeral(num: number): string {
  const roman: Record<number, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII',
    8: 'VIII',
    9: 'IX',
    10: 'X',
  };
  return roman[num] || String(num);
}