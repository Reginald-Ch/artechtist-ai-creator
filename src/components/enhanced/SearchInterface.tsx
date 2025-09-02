import React, { useState } from 'react';
import { Search, Filter, X, Book, MessageSquare, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchLessons } from '@/hooks/useSearchLessons';
import { SearchSkeleton } from './LoadingStates';
import { Lesson, SearchResult } from '@/types/lesson';

interface SearchInterfaceProps {
  lessons: Record<string, Lesson>;
  onSelectResult: (result: SearchResult) => void;
  isLoading?: boolean;
}

export const SearchInterface = ({ lessons, onSelectResult, isLoading }: SearchInterfaceProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    searchResults,
    clearSearch,
    hasActiveSearch
  } = useSearchLessons(lessons);

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'lesson': return <Book className="w-4 h-4 text-primary" />;
      case 'panel': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'flashcard': return <Layers className="w-4 h-4 text-green-500" />;
      default: return <Book className="w-4 h-4" />;
    }
  };

  const getResultBadge = (type: SearchResult['type']) => {
    const colors = {
      lesson: 'bg-primary/10 text-primary',
      panel: 'bg-blue-100 text-blue-700',
      flashcard: 'bg-green-100 text-green-700'
    };
    return colors[type] || '';
  };

  if (isLoading) {
    return <SearchSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search lessons, topics, or concepts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-7 px-2"
          >
            <Filter className="w-3 h-3" />
          </Button>
          {hasActiveSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-7 px-2"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <Select value={filters.difficulty} onValueChange={(value) => setFilters({...filters, difficulty: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Any difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any difficulty</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Any category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any category</SelectItem>
                  <SelectItem value="fundamentals">Fundamentals</SelectItem>
                  <SelectItem value="data">Data & Learning</SelectItem>
                  <SelectItem value="ethics">Ethics</SelectItem>
                  <SelectItem value="applications">Applications</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Search Results */}
      {hasActiveSearch && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Search Results</h3>
            <Badge variant="outline">{searchResults.length} found</Badge>
          </div>
          
          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground">
                  Try different keywords or check your spelling
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {searchResults.map((result, index) => (
                <Card 
                  key={`${result.type}-${result.id}-${index}`}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSelectResult(result)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getResultIcon(result.type)}
                          <h4 className="font-medium text-sm">{result.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.content}
                        </p>
                      </div>
                      <Badge className={getResultBadge(result.type)}>
                        {result.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};