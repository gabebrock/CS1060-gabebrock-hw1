import { MetObject } from '@/types/met';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink, Calendar, Palette, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArtworkModalProps {
  artwork: MetObject | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ArtworkModal = ({ artwork, isOpen, onClose }: ArtworkModalProps) => {
  if (!artwork) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold pr-8">
            {artwork.title}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Full size image */}
          <div className="relative overflow-hidden rounded-lg bg-muted">
            {artwork.primaryImage ? (
              <img
                src={artwork.primaryImage}
                alt={artwork.title}
                className="w-full h-auto object-contain max-h-[60vh]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = artwork.primaryImageSmall || '/placeholder.svg';
                }}
              />
            ) : artwork.primaryImageSmall ? (
              <img
                src={artwork.primaryImageSmall}
                alt={artwork.title}
                className="w-full h-auto object-contain max-h-[60vh]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>
          
          {/* Artwork details */}
          <div className="space-y-3">
            {artwork.artistDisplayName && (
              <p className="text-lg text-muted-foreground">
                by {artwork.artistDisplayName}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {artwork.objectDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{artwork.objectDate}</span>
                </div>
              )}
              {artwork.medium && (
                <div className="flex items-center gap-1">
                  <Palette className="w-4 h-4" />
                  <span>{artwork.medium}</span>
                </div>
              )}
            </div>
            
            {artwork.department && (
              <div className="text-sm bg-accent/50 text-accent-foreground px-3 py-1 rounded-full inline-block">
                {artwork.department}
              </div>
            )}
            
            {artwork.dimensions && (
              <p className="text-sm text-muted-foreground">
                <strong>Dimensions:</strong> {artwork.dimensions}
              </p>
            )}
            
            {artwork.creditLine && (
              <p className="text-sm text-muted-foreground">
                <strong>Credit:</strong> {artwork.creditLine}
              </p>
            )}
            
            {artwork.objectURL && (
              <a
                href={artwork.objectURL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View at The Met Museum
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};