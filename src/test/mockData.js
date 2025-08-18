export const mockMembers = {
  member1: {
    id: 'member_1',
    name: 'John Doe',
    birthDate: '1980-05-15',
    birthPlace: 'Bamenda',
    tribe: 'Bamileke',
    treeId: 'tree_1'
  },
  member2: {
    id: 'member_2',
    name: 'John Doh',
    birthDate: '1980-05-16',
    birthPlace: 'Bamenda',
    tribe: 'Bamileke',
    treeId: 'tree_2'
  },
  member3: {
    id: 'member_3',
    name: 'Jane Smith',
    birthDate: '1975-03-20',
    birthPlace: 'Douala',
    tribe: 'Duala',
    treeId: 'tree_3'
  }
};

export const mockPublicMatchPool = [
  {
    memberId: 'member_2',
    treeId: 'tree_2',
    name: 'John Doh',
    birthDate: '1980-05-16',
    birthPlace: 'Bamenda',
    tribe: 'Bamileke'
  },
  {
    memberId: 'member_3',
    treeId: 'tree_3',
    name: 'Jane Smith',
    birthDate: '1975-03-20',
    birthPlace: 'Douala',
    tribe: 'Duala'
  }
];

export const mockSuggestions = [
  {
    id: 'sugg_1',
    type: 'cross-tree-match',
    sourceMemberId: 'member_1',
    sourceTreeId: 'tree_1',
    targetMemberId: 'member_2',
    targetTreeId: 'tree_2',
    matchScore: 0.85,
    evidence: ['Similar names: John Doe ↔ John Doh', 'Close birth dates: 1980-05-15 ↔ 1980-05-16'],
    status: 'pending',
    requiresApproval: true
  }
];
