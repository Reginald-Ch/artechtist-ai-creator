import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  X,
  Filter,
  History
} from 'lucide-react';
import { Lesson, SearchResult } from '@/types/lesson';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdvancedSearchProps {
  lessons: Lesson[];
  onSelectResult: (result: SearchResult) => void;
  userAgeGroup?: string;
  userSkillLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export const AdvancedSearch = ({ 
  lessons, 
  onSelectResult,
  userAgeGroup,
  userSkillLevel
}: AdvancedSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
  }, []);

  // Configure Fuse.js for fuzzy searching
  const fuse = useMemo(() => {
    const searchableData = lessons.flatMap(lesson => [
      {
        type: 'lesson' as const,
        id: lesson.id,
        title: lesson.title,
        content: lesson.description,
        difficulty: lesson.difficulty,
        character: lesson.character,
        duration: lesson.duration,
        ageGroup: (lesson as any).ageGroup,
        tags: (lesson as any).tags || [],
        panels: lesson.panels,
        flashcards: lesson.flashcards
      },
      ...lesson.panels.map((panel, index) => ({
        type: 'panel' as const,
        id: `${lesson.id}-panel-${index}`,
        title: `${lesson.title} - Panel ${index + 1}`,
        content: panel.dialogue,
        difficulty: lesson.difficulty,
        character: panel.character,
        panelIndex: index,
        lessonTitle: lesson.title,
        ageGroup: (lesson as any).ageGroup
      })),
      ...lesson.flashcards.map((card, index) => ({
        type: 'flashcard' as const,
        id: `${lesson.id}-card-${card.id}`,
        title: card.question,
        content: card.answer,
        difficulty: card.difficulty,
        category: card.category,
        cardIndex: index,
        lessonTitle: lesson.title,
        ageGroup: (lesson as any).ageGroup
      }))
    ]);

    return new Fuse(searchableData, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'content', weight: 1.5 },
        { name: 'character', weight: 1 },
        { name: 'tags', weight: 1.2 },
        { name: 'category', weight: 1 }
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true
    });
  }, [lessons]);

  // Search suggestions based on partial input
  const suggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    
    const results = fuse.search(searchQuery).slice(0, 5);
    return results.map(result => result.item.title);
  }, [searchQuery, fuse]);

  // Popular searches (could be dynamically tracked)
  const popularSearches = [
    'machine learning',
    'neural networks',
    'AI ethics',
    'chatbots',
    'data training'
  ];

  const handleSearch = (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Save to recent searches
    const updatedRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

    // Perform fuzzy search
    let results = fuse.search(query).map(result => {
      const item = result.item as any;
      return {
        type: item.type,
        id: item.id,
        title: item.title,
        content: item.content,
        relevance: 1 - (result.score || 0),
        metadata: {
          difficulty: item.difficulty,
          character: item.character,
          duration: item.duration,
          panelCount: item.panels?.length,
          flashcardCount: item.flashcards?.length,
          lessonTitle: item.lessonTitle,
          answer: item.content,
          cardIndex: item.cardIndex,
          panelIndex: item.panelIndex,
          category: item.category,
          ageGroup: item.ageGroup
        }
      };
    });

    // Apply filters
    if (selectedDifficulty !== 'all') {
      results = results.filter(r => 
        r.metadata.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase()
      );
    }

    if (selectedAgeGroup !== 'all') {
      results = results.filter(r => 
        r.metadata.ageGroup === selectedAgeGroup
      );
    }

    // Filter by user's skill level if provided
    if (userSkillLevel && selectedDifficulty === 'all') {
      const skillLevelMap = {
        beginner: ['beginner'],
        intermediate: ['beginner', 'intermediate'],
        advanced: ['beginner', 'intermediate', 'advanced']
      };
      results = results.filter(r => 
        skillLevelMap[userSkillLevel].includes(r.metadata.difficulty?.toLowerCase() || '')
      );
    }

    setSearchResults(results);
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="h-4 w-4" />;
      case 'panel': return <Clock className="h-4 w-4" />;
      case 'flashcard': return <TrendingUp className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-blue-100 text-blue-800';
      case 'panel': return 'bg-green-100 text-green-800';
      case 'flashcard': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Advanced Search
          </CardTitle>
          <CardDescription>
            Find lessons, panels, and flashcards with intelligent search
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lessons, topics, or concepts..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(e.target.value.length >= 2);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchQuery);
                    }
                  }}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button onClick={() => handleSearch(searchQuery)}>
                Search
              </Button>
            </div>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <Card className="absolute z-10 w-full mt-2 shadow-lg">
                <CardContent className="p-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Age Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="little-explorers">Little Explorers (6-8)</SelectItem>
                <SelectItem value="young-builders">Young Builders (9-11)</SelectItem>
                <SelectItem value="ai-ambassadors">AI Ambassadors (12-14)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recent & Popular Searches */}
          {!searchQuery && (
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <History className="h-4 w-4" />
                      Recent Searches
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearRecentSearches}
                      className="h-6 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleSelectSuggestion(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  Popular Searches
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleSelectSuggestion(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchResults.map((result, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSelectResult(result)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(result.type)}
                          <Badge className={getTypeBadgeColor(result.type)}>
                            {result.type}
                          </Badge>
                          {result.metadata.difficulty && (
                            <Badge className={getDifficultyColor(result.metadata.difficulty)}>
                              {result.metadata.difficulty}
                            </Badge>
                          )}
                          {result.metadata.category && (
                            <Badge variant="outline">
                              {result.metadata.category}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold mb-1">{result.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.content}
                        </p>
                        {result.metadata.lessonTitle && (
                          <p className="text-xs text-muted-foreground mt-1">
                            From: {result.metadata.lessonTitle}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(result.relevance * 100)}% match
                        </Badge>
                        {result.metadata.duration && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {result.metadata.duration}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchQuery && searchResults.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
