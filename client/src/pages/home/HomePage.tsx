import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Map, Users, MessageSquare } from 'lucide-react';

export function HomePage() {
    return (
        <div className="flex flex-col gap-16 py-8 md:py-20 animate-in fade-in duration-500">
            {/* Hero Section */}
            <section className="text-center space-y-8 max-w-4xl mx-auto">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter text-foreground">
                        Plan Your Next <span className="text-primary block md:inline">Adventure</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        TripSync is the all-in-one platform for collaborative travel planning. 
                        Build itineraries, track budgets, and chat with friends in real-time.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                    <Button asChild size="lg" className="rounded-full text-lg h-12 px-8 font-semibold shadow-lg hover:shadow-xl transition-all">
                        <Link to="/my-trips">Start Planning Free</Link>
                    </Button>
                </div>
            </section>

            {/* Features Preview */}
            <section className="grid md:grid-cols-3 gap-8 px-4">
                <FeatureCard
                    icon={<Map className="h-6 w-6 text-primary-foreground" />}
                    title="Smart Itineraries"
                    description="Build itinerary together with AI suggestions by providing your preferences."
                />
                <FeatureCard
                    icon={<Users className="h-6 w-6 text-primary-foreground" />}
                    title="Real-time Collaboration"
                    description="Invite friends and see changes instantly. Plan together, not alone."
                />
                <FeatureCard
                    icon={<MessageSquare className="h-6 w-6 text-primary-foreground" />}
                    title="Group Chat"
                    description="Keep conversations where your plans are. No more switching apps."
                />
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="group p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
            <div className="mb-6 bg-primary w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-card-foreground">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">
                {description}
            </p>
        </div>
    );
}
