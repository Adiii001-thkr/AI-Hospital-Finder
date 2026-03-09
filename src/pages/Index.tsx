import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Pill, Building, ArrowRight, Heart, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const features = [
    {
      icon: Pill,
      title: 'Find Medicines',
      description: 'Search from thousands of medicines with real-time availability and pricing.',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: Building,
      title: 'Locate Hospitals',
      description: 'Discover hospitals and labs near you with ratings and specialties.',
      color: 'bg-healthcare-blue/10 text-healthcare-blue',
    },
    {
      icon: Shield,
      title: 'Trusted Information',
      description: 'Verified healthcare providers and authentic medicine listings.',
      color: 'bg-success/10 text-success',
    },
    {
      icon: Clock,
      title: '24/7 Access',
      description: 'Access healthcare information anytime, anywhere, on any device.',
      color: 'bg-healthcare-orange/10 text-healthcare-orange',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-subtle py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-healthcare-blue/5 blur-3xl animate-pulse-slow" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Your Health, Our Priority</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
              Find the Right
              <span className="text-gradient"> Healthcare </span>
              for You
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Search medicines, locate hospitals and labs in your city. 
              Get trusted healthcare information at your fingertips.
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medicines, hospitals, or labs..."
                    className="pl-12 h-14 text-base shadow-lg"
                  />
                </div>
                <Button type="submit" size="xl" variant="hero" className="sm:w-auto w-full">
                  Search
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </form>
            
            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-4 mt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/medicines">
                <Button variant="outline" size="lg">
                  <Pill className="w-4 h-4" />
                  Browse Medicines
                </Button>
              </Link>
              <Link to="/hospitals">
                <Button variant="outline" size="lg">
                  <Building className="w-4 h-4" />
                  Find Hospitals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose HealthFinder?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide comprehensive healthcare information to help you make informed decisions.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-background border-2 border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Register now to access all features and manage your healthcare information.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth?mode=register">
                <Button size="xl" className="bg-card text-primary hover:bg-card/90">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/medicines">
                <Button size="xl" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Explore Medicines
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-foreground">HealthFinder</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 HealthFinder. Built for interviews and demonstrations.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
