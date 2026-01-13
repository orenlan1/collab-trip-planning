import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="flex dark:bg-slate-900 bg-sky-50 flex-col items-center justify-center min-h-screen space-y-6 text-center px-4">
            <div className="space-y-2">
                <h1 className="text-7xl font-extrabold tracking-tighter text-foreground">404</h1>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground/80">Page not found</h2>
            </div>
            <p className="text-muted-foreground max-w-[500px] text-lg">
                The page you are looking for does not exist. It might have been moved or deleted.
            </p>
            <Button asChild size="lg">
                <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Home
                </Link>
            </Button>
        </div>
    );
}