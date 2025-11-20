import { AuthProvider } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { CalendarGrid } from '@/components/CalendarGrid';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8">
          <CalendarGrid />
        </main>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
