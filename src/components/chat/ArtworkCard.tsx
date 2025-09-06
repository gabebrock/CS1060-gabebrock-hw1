import { MetObject } from '@/types/met';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Calendar, Palette } from 'lucide-react';

interface ArtworkCardProps {
  artwork: MetObject;
  onImageClick?: () => void;
}

export const ArtworkCard = ({ artwork, onImageClick }: ArtworkCardProps) => {
  return (
    <Card className="overflow-hidden bg-gradient-artwork border-border/50 hover:shadow-lg transition-all duration-300">
      <div 
        className="aspect-[4/3] relative overflow-hidden bg-muted cursor-pointer" 
        onClick={onImageClick}
      >
        {artwork.primaryImageSmall && (
          <img
            src={artwork.primaryImageSmall}
            alt={artwork.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 text-foreground">
            {artwork.title}
          </h3>
          {artwork.artistDisplayName && (
            <p className="text-sm text-muted-foreground mt-1">
              by {artwork.artistDisplayName}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {artwork.objectDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{artwork.objectDate}</span>
            </div>
          )}
          {artwork.medium && (
            <div className="flex items-center gap-1">
              <Palette className="w-3 h-3" />
              <span className="line-clamp-1">{artwork.medium}</span>
            </div>
          )}
        </div>
        
        {artwork.department && (
          <div className="text-xs bg-accent/50 text-accent-foreground px-2 py-1 rounded-full inline-block">
            {artwork.department}
          </div>
        )}
        
        {artwork.objectURL && (
          <a
            href={artwork.objectURL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View at The Met
          </a>
        )}
      </CardContent>
    </Card>
  );
};