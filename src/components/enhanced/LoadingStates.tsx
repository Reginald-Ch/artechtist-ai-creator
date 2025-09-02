import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const LessonCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-12" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
    </CardContent>
  </Card>
);

export const TopicCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader className="text-center space-y-4">
      <Skeleton className="w-16 h-16 rounded-full mx-auto" />
      <div>
        <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-12" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex justify-between p-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-6" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const LessonViewSkeleton = () => (
  <Card className="max-w-4xl mx-auto">
    <CardHeader>
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <Skeleton className="h-2 w-full" />
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="p-6 border rounded-2xl">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-10 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const SearchSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <Card key={i} className="animate-pulse">
        <CardContent className="p-4">
          <div className="flex justify-between">
            <div className="flex-1">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-6 w-16 ml-4" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);