import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const suggestionService = {
  // Generate relationship suggestions
  async generateSuggestions(treeId, personId) {
    try {
      const suggestions = [];
      
      // Get all people in the tree
      const treeMembers = await this.getTreeMembers(treeId);
      const targetPerson = treeMembers.find(p => p.id === personId);
      
      if (!targetPerson) return [];
      
      // Internal suggestions (within same tree)
      const internalSuggestions = this.findInternalMatches(targetPerson, treeMembers);
      suggestions.push(...internalSuggestions);
      
      // External suggestions (from public match pool)
      const externalSuggestions = await this.findExternalMatches(targetPerson, treeId);
      suggestions.push(...externalSuggestions);
      
      // Store suggestions
      for (const suggestion of suggestions) {
        await this.storeSuggestion(suggestion);
      }
      
      return suggestions;
    } catch (error) {
      throw new Error(`Failed to generate suggestions: ${error.message}`);
    }
  },

  // Find matches within the same tree
  findInternalMatches(person, treeMembers) {
    const suggestions = [];
    
    for (const member of treeMembers) {
      if (member.id === person.id) continue;
      
      const matchScore = this.calculateMatchScore(person, member);
      
      if (matchScore > 0.7) {
        suggestions.push({
          id: `internal_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          type: 'internal',
          sourcePersonId: person.id,
          targetPersonId: member.id,
          sourceTreeId: person.treeId,
          targetTreeId: member.treeId,
          matchScore: matchScore,
          suggestedRelation: this.determineSuggestedRelation(person, member),
          evidence: this.generateEvidence(person, member),
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }
    }
    
    return suggestions;
  },

  // Find matches from public match pool
  async findExternalMatches(person, currentTreeId) {
    try {
      const publicPoolQuery = query(
        collection(db, 'publicMatchPool'),
        where('treeId', '!=', currentTreeId)
      );
      
      const snapshot = await getDocs(publicPoolQuery);
      const publicMatches = snapshot.docs.map(doc => doc.data());
      
      const suggestions = [];
      
      for (const match of publicMatches) {
        const matchScore = this.calculateExternalMatchScore(person, match);
        
        if (matchScore > 0.8) {
          suggestions.push({
            id: `external_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            type: 'external',
            sourcePersonId: person.id,
            targetPersonId: match.personId,
            sourceTreeId: person.treeId,
            targetTreeId: match.treeId,
            matchScore: matchScore,
            suggestedRelation: this.determineSuggestedRelation(person, match),
            evidence: this.generateEvidence(person, match),
            status: 'pending',
            requiresApproval: true,
            createdAt: new Date().toISOString()
          });
        }
      }
      
      return suggestions;
    } catch (error) {
      console.error('Error finding external matches:', error);
      return [];
    }
  },

  // Calculate match score between two people
  calculateMatchScore(person1, person2) {
    let score = 0;
    let factors = 0;
    
    // Name similarity
    if (person1.name && person2.name) {
      const nameSimilarity = this.calculateStringSimilarity(
        person1.name.toLowerCase(),
        person2.name.toLowerCase()
      );
      score += nameSimilarity * 0.4;
      factors += 0.4;
    }
    
    // Birth date proximity
    if (person1.dob && person2.dob) {
      const dateProximity = this.calculateDateProximity(person1.dob, person2.dob);
      score += dateProximity * 0.3;
      factors += 0.3;
    }
    
    // Gender match
    if (person1.gender && person2.gender) {
      score += (person1.gender === person2.gender ? 1 : 0) * 0.1;
      factors += 0.1;
    }
    
    // Location/village similarity (if available in bio)
    if (person1.bio && person2.bio) {
      const locationSimilarity = this.extractLocationSimilarity(person1.bio, person2.bio);
      score += locationSimilarity * 0.2;
      factors += 0.2;
    }
    
    return factors > 0 ? score / factors : 0;
  },

  // Calculate string similarity using Levenshtein distance
  calculateStringSimilarity(str1, str2) {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;
    
    const distance = this.levenshteinDistance(str1, str2);
    return 1 - (distance / maxLength);
  },

  // Levenshtein distance algorithm
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  },

  // Calculate date proximity
  calculateDateProximity(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const daysDiff = Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
    
    // Same date = 1, 1 year apart = ~0.5, 5+ years apart = 0
    return Math.max(0, 1 - (daysDiff / 1825));
  },

  // Extract location similarity from bio text
  extractLocationSimilarity(bio1, bio2) {
    // Simple implementation - look for common location keywords
    const locations1 = this.extractLocations(bio1);
    const locations2 = this.extractLocations(bio2);
    
    const commonLocations = locations1.filter(loc => 
      locations2.some(loc2 => 
        this.calculateStringSimilarity(loc.toLowerCase(), loc2.toLowerCase()) > 0.8
      )
    );
    
    return commonLocations.length > 0 ? 0.8 : 0;
  },

  // Extract potential location names from text
  extractLocations(text) {
    // Basic implementation - could be enhanced with NLP
    const commonLocationWords = [
      'village', 'town', 'city', 'region', 'province', 'quarter',
      'bamenda', 'douala', 'yaounde', 'bafoussam', 'bafang'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => 
      word.length > 3 && 
      (commonLocationWords.includes(word) || /^[A-Z]/.test(word))
    );
  },

  // Determine suggested relationship type
  determineSuggestedRelation(person1, person2) {
    // Simple age-based heuristic
    if (person1.dob && person2.dob) {
      const age1 = new Date().getFullYear() - new Date(person1.dob).getFullYear();
      const age2 = new Date().getFullYear() - new Date(person2.dob).getFullYear();
      const ageDiff = Math.abs(age1 - age2);
      
      if (ageDiff < 5) return 'sibling';
      if (ageDiff > 15 && age1 > age2) return 'child';
      if (ageDiff > 15 && age2 > age1) return 'parent';
      return 'cousin';
    }
    
    return 'relative';
  },

  // Generate evidence for match
  generateEvidence(person1, person2) {
    const evidence = [];
    
    if (person1.name && person2.name) {
      const similarity = this.calculateStringSimilarity(
        person1.name.toLowerCase(),
        person2.name.toLowerCase()
      );
      if (similarity > 0.7) {
        evidence.push(`Similar names: ${person1.name} ↔ ${person2.name}`);
      }
    }
    
    if (person1.dob && person2.dob) {
      const proximity = this.calculateDateProximity(person1.dob, person2.dob);
      if (proximity > 0.5) {
        evidence.push(`Close birth dates: ${person1.dob} ↔ ${person2.dob}`);
      }
    }
    
    return evidence;
  },

  // Store suggestion in database
  async storeSuggestion(suggestion) {
    try {
      await setDoc(doc(db, 'suggestions', suggestion.id), {
        ...suggestion,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error storing suggestion:', error);
    }
  },

  // Get suggestions for a tree
  async getTreeSuggestions(treeId) {
    try {
      const suggestionsQuery = query(
        collection(db, 'suggestions'),
        where('sourceTreeId', '==', treeId),
        where('status', '==', 'pending'),
        orderBy('matchScore', 'desc')
      );
      
      const snapshot = await getDocs(suggestionsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Failed to get suggestions: ${error.message}`);
    }
  },

  // Add AI-powered relationship detection
  async generateAISuggestions(treeId, personId) {
    try {
      const person = await this.getPerson(personId);
      const treeMembers = await this.getTreeMembers(treeId);
      
      // Use existing logic + AI enhancements
      const suggestions = await this.generateSuggestions(treeId, personId);
      
      // Add cross-tree matching for diaspora connections
      const crossTreeSuggestions = await this.findCrossTreeMatches(person);
      
      return [...suggestions, ...crossTreeSuggestions];
    } catch (error) {
      throw new Error(`Failed to generate AI suggestions: ${error.message}`);
    }
  },

  // Cross-tree matching for diaspora families
  async findCrossTreeMatches(person) {
    try {
      const publicTreesQuery = query(
        collection(db, 'trees'),
        where('isPublic', '==', true),
        where('mergeOptIn', '==', true)
      );
      
      const snapshot = await getDocs(publicTreesQuery);
      const suggestions = [];
      
      for (const treeDoc of snapshot.docs) {
        const treeData = treeDoc.data();
        if (treeData.id === person.treeId) continue;
        
        const treeMembers = await this.getTreeMembers(treeData.id);
        const matches = this.findPotentialMatches(person, treeMembers);
        
        suggestions.push(...matches.map(match => ({
          ...match,
          type: 'cross-tree',
          targetTreeId: treeData.id,
          requiresApproval: true
        })));
      }
      
      return suggestions;
    } catch (error) {
      console.error('Cross-tree matching error:', error);
      return [];
    }
  }
};
