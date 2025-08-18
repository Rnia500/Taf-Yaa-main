import { describe, it, expect } from 'vitest';
import { suggestionService } from '../services/suggestionService';
import { mockMembers } from './mockData';

describe('SuggestionService - Evidence Generation', () => {
  it('should generate name similarity evidence', () => {
    const evidence = suggestionService.generateEvidence(mockMembers.member1, mockMembers.member2);
    expect(evidence).toContain('Similar names: John Doe ↔ John Doh');
  });

  it('should generate birth date evidence', () => {
    const evidence = suggestionService.generateEvidence(mockMembers.member1, mockMembers.member2);
    expect(evidence).toContain('Close birth dates: 1980-05-15 ↔ 1980-05-16');
  });

  it('should not generate evidence for low similarity', () => {
    const evidence = suggestionService.generateEvidence(mockMembers.member1, mockMembers.member3);
    expect(evidence).toHaveLength(0);
  });

  it('should handle missing data', () => {
    const member1 = { name: 'John Doe' };
    const member2 = { name: 'Jane Smith' };
    const evidence = suggestionService.generateEvidence(member1, member2);
    expect(evidence).toBeInstanceOf(Array);
  });
});