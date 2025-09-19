import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  X, 
  BookOpen, 
  MessageCircle, 
  Star,
  Clock,
  Zap,
  TrendingUp
} from 'lucide-react';
import { SearchResult, Lesson } from '@/types/lesson';
import { motion, AnimatePresence } from 'framer-motion';

interface ImprovedSearchInterfaceProps {
  lessons: Record<string, Lesson>;
  onSelectResult: (result: SearchResult) => void;
  isLoading?: boolean;
}

export const ImprovedSearchInterface: React.FC<ImprovedSearchInterfaceProps> = ({
  lessons,
  onSelectResult,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'title' | 'difficulty'>('relevance');

  // Enhanced search with better scoring
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    Object.values(lessons).forEach(lesson => {
      let relevanceScore = 0;

      // Search in lesson title (highest weight)
      if (lesson.title.toLowerCase().includes(query)) {
        relevanceScore += 20;
        if (lesson.title.toLowerCase().startsWith(query)) {
          relevanceScore += 10; // Bonus for starting with query
        }
      }

      // Search in description (medium weight)
      if (lesson.description.toLowerCase().includes(query)) {
        relevanceScore += 10;
      }

      // Search in character name (medium weight)
      if (lesson.character.toLowerCase().includes(query)) {
        relevanceScore += 8;
      }

      // Search in difficulty (low weight)
      if (lesson.difficulty.toLowerCase().includes(query)) {
        relevanceScore += 5;
      }

      if (relevanceScore > 0) {
        results.push({
          type: 'lesson',
          id: lesson.id,
          title: lesson.title,
          content: lesson.description,
          relevance: relevanceScore,
          metadata: {
            difficulty: lesson.difficulty,
            duration: lesson.duration,
            character: lesson.character,
            panelCount: lesson.panels?.length || 0,
            flashcardCount: lesson.flashcards?.length || 0
          }
        });
      }

      // Search in panels (lower weight)
      lesson.panels?.forEach((panel, index) => {
        if (panel.dialogue.toLowerCase().includes(query) ||
            panel.character.toLowerCase().includes(query)) {
          results.push({
            type: 'panel',
            id: `${lesson.id}-panel-${index}`,
            title: `${lesson.title} - Panel ${index + 1}`,
            content: panel.dialogue,
            relevance: 3,
            metadata: {
              lessonTitle: lesson.title,
              character: panel.character,
              panelIndex: index
            }
          });
        }
      });

      // Search in flashcards (lower weight)
      lesson.flashcards?.forEach((card, index) => {
        if (card.question.toLowerCase().includes(query) ||
            card.answer.toLowerCase().includes(query)) {
          results.push({
            type: 'flashcard',
            id: `${lesson.id}-flashcard-${index}`,
            title: `${lesson.title} - Flashcard ${index + 1}`,
            content: card.question,
            relevance: 2,
            metadata: {
              lessonTitle: lesson.title,
              answer: card.answer,
              cardIndex: index
            }
          });
        }
      });
    });

    // Sort by selected criteria
    return results.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
          const diffA = difficultyOrder[a.metadata?.difficulty as keyof typeof difficultyOrder] || 999;
          const diffB = difficultyOrder[b.metadata?.difficulty as keyof typeof difficultyOrder] || 999;
          return diffA - diffB;
        default:
          return b.relevance - a.relevance;
      }
    });
  }, [searchQuery, lessons, sortBy]);

  // Filter results by type
  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return searchResults;
    return searchResults.filter(result => result.type === activeTab);
  }, [searchResults, activeTab]);

  // Quick filters based on common searches
  const quickFilters = [
    { label: 'Beginner', query: 'beginner' },
    { label: 'AI Basics', query: 'artificial intelligence' },
    { label: 'Machine Learning', query: 'machine learning' },
    { label: 'Data Science', query: 'data' },
    { label: 'Ethics', query: 'bias ethics' },
    { label: 'Chatbots', query: 'chatbot' }
  ];

  const handleQuickFilter = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedFilters([]);
    setActiveTab('all');
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'lesson': return BookOpen;
      case 'panel': return MessageCircle;
      case 'flashcard': return Star;
      default: return BookOpen;
    }
  };

  const highlightQuery = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800/50 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <motion.div
            className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Search className="h-8 w-8" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Smart Search
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find exactly what you're looking for across all lessons, panels, and flashcards
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for topics, concepts, or specific content..."
          className="pl-10 pr-12 h-12 text-lg"
        />
        {searchQuery && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {quickFilters.map(filter => (
          <Button
            key={filter.label}
            size="sm"
            variant="outline"
            onClick={() => handleQuickFilter(filter.query)}
            className="text-xs"
          >
            <Zap className="h-3 w-3 mr-1" />
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">
                {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
              </h3>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border rounded-md bg-background text-sm"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="title">Sort by Title</option>
                <option value="difficulty">Sort by Difficulty</option>
              </select>
            </div>
            <Button variant="outline" size="sm" onClick={clearSearch}>
              Clear Search
            </Button>
          </div>

          {/* Result Type Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
              <TabsTrigger value="all" className="text-xs">
                All ({searchResults.length})
              </TabsTrigger>
              <TabsTrigger value="lesson" className="text-xs">
                Lessons ({searchResults.filter(r => r.type === 'lesson').length})
              </TabsTrigger>
              <TabsTrigger value="panel" className="text-xs">
                Panels ({searchResults.filter(r => r.type === 'panel').length})
              </TabsTrigger>
              <TabsTrigger value="flashcard" className="text-xs">
                Cards ({searchResults.filter(r => r.type === 'flashcard').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-3 bg-muted rounded w-full"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {filteredResults.map((result, index) => {
                      const Icon = getResultIcon(result.type);
                      return (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card 
                            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
                            onClick={() => onSelectResult(result)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-primary" />
                                  <Badge variant="outline" className="capitalize text-xs">
                                    {result.type}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <TrendingUp className="h-3 w-3" />
                                  {result.relevance}
                                </div>
                              </div>
                              <CardTitle className="text-sm leading-tight">
                                {highlightQuery(result.title, searchQuery)}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <CardDescription className="text-xs line-clamp-2">
                                {highlightQuery(result.content, searchQuery)}
                              </CardDescription>
                              
                              {/* Metadata */}
                              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                {result.metadata?.difficulty && (
                                  <Badge variant="secondary" className="text-xs">
                                    {result.metadata.difficulty}
                                  </Badge>
                                )}
                                {result.metadata?.duration && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {result.metadata.duration}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search query or using different keywords
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickFilters.slice(0, 3).map(filter => (
                      <Button
                        key={filter.label}
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickFilter(filter.query)}
                      >
                        Try "{filter.label}"
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Empty State */}
      {!searchQuery && (
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Start Searching</h3>
            <p className="text-muted-foreground mb-6">
              Enter a search term above to find lessons, content, and more
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-md mx-auto">
              {quickFilters.slice(0, 6).map(filter => (
                <Button
                  key={filter.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFilter(filter.query)}
                  className="text-xs"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};