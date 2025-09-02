import { useState, useMemo, useCallback } from 'react';
import { Lesson, SearchResult } from '@/types/lesson';

export const useSearchLessons = (lessons: Record<string, Lesson>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: '',
    category: '',
    completed: false
  });

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    Object.values(lessons).forEach(lesson => {
      // Search in lesson title and description
      if (lesson.title.toLowerCase().includes(query) || 
          lesson.description.toLowerCase().includes(query)) {
        results.push({
          type: 'lesson',
          id: lesson.id,
          title: lesson.title,
          content: lesson.description,
          relevance: lesson.title.toLowerCase().includes(query) ? 10 : 5
        });
      }

      // Search in panels
      lesson.panels.forEach(panel => {
        if (panel.dialogue.toLowerCase().includes(query) ||
            panel.character.toLowerCase().includes(query)) {
          results.push({
            type: 'panel',
            id: `${lesson.id}-${panel.id}`,
            title: `${lesson.title} - Panel ${panel.id}`,
            content: panel.dialogue,
            relevance: 3
          });
        }
      });

      // Search in flashcards
      lesson.flashcards.forEach(card => {
        if (card.question.toLowerCase().includes(query) ||
            card.answer.toLowerCase().includes(query)) {
          results.push({
            type: 'flashcard',
            id: `${lesson.id}-flashcard-${card.id}`,
            title: `${lesson.title} - Flashcard`,
            content: card.question,
            relevance: 2
          });
        }
      });
    });

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  }, [searchQuery, lessons]);

  const filteredLessons = useMemo(() => {
    return Object.values(lessons).filter(lesson => {
      if (filters.difficulty && lesson.difficulty !== filters.difficulty) return false;
      // Add more filter logic here
      return true;
    });
  }, [lessons, filters]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setFilters({ difficulty: '', category: '', completed: false });
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    searchResults,
    filteredLessons,
    clearSearch,
    hasActiveSearch: searchQuery.trim().length > 0
  };
};