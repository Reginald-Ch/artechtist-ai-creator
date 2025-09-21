import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, Upload, Trash2, Share, Star } from 'lucide-react';
import { toast } from 'sonner';

interface SavedModel {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  dateCreated: string;
  data: any;
  favorite: boolean;
}

interface ModelPersistenceProps {
  models: SavedModel[];
  onSaveModel: (model: Omit<SavedModel, 'id' | 'dateCreated'>) => void;
  onLoadModel: (model: SavedModel) => void;
  onDeleteModel: (id: string) => void;
  onFavoriteModel: (id: string) => void;
}

export const ModelPersistence: React.FC<ModelPersistenceProps> = ({
  models,
  onSaveModel,
  onLoadModel,
  onDeleteModel,
  onFavoriteModel
}) => {
  const [newModelName, setNewModelName] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'accuracy' | 'name'>('date');

  const sortedModels = [...models].sort((a, b) => {
    switch (sortBy) {
      case 'accuracy':
        return b.accuracy - a.accuracy;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
      default:
        return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
    }
  });

  const downloadModel = (model: SavedModel) => {
    const dataStr = JSON.stringify(model, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Model downloaded!');
  };

  const shareModel = async (model: SavedModel) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My AI Model: ${model.name}`,
          text: `Check out my ${model.type} model with ${model.accuracy}% accuracy!`,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort by:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="date">Date Created</option>
            <option value="accuracy">Accuracy</option>
            <option value="name">Name</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {models.length} model{models.length !== 1 ? 's' : ''} saved
          </span>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedModels.map((model) => (
          <Card 
            key={model.id} 
            className={`hover:shadow-lg transition-all ${
              model.favorite ? 'ring-2 ring-yellow-200 bg-yellow-50/50' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {model.name}
                    {model.favorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{model.type}</Badge>
                    <Badge 
                      className={model.accuracy >= 90 ? 'bg-green-100 text-green-800' : 
                                 model.accuracy >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                                 'bg-red-100 text-red-800'}
                    >
                      {model.accuracy}% accuracy
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onFavoriteModel(model.id)}
                >
                  <Star className={`h-4 w-4 ${model.favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(model.dateCreated).toLocaleDateString()}
                </div>
                
                <div className="flex flex-wrap gap-1">
                  <Button 
                    size="sm" 
                    onClick={() => onLoadModel(model)}
                    className="flex-1"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Load
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => downloadModel(model)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => shareModel(model)}
                  >
                    <Share className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => onDeleteModel(model.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {models.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Models Saved Yet</h3>
            <p className="text-muted-foreground">
              Complete training on any AI model to save it to your collection!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};