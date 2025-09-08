import { MuseumChatbot } from '@/components/MuseumChatbot';
import { BugReportForm } from '@/components/BugReportForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-museum p-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)]">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            MET Museum Art Curator
          </h1>
          <p className="text-muted-foreground">
            Discover artworks that match your mood from The Metropolitan Museum collection
          </p>
        </div>
        <div className="h-[calc(100%-8rem)]">
          <MuseumChatbot />
        </div>
        <div className="text-center mt-4">
          <BugReportForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
