import { useState } from "react";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Play, TrendingUp, Users, DollarSign, ArrowRight, Sparkles } from "lucide-react";
import OnboardingDemo from "../components/OnboardingDemo";

export default function Landing() {
  const { login } = useAuth();
  const [isHovering, setIsHovering] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const features = [
    {
      icon: <Play className="w-6 h-6" />,
      title: "Watch & Engage",
      description: "Discover shorts and full-length content from top creators"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Invest in Content",
      description: "Buy shares of viral videos and earn as they grow"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Support Creators",
      description: "Subscribe and directly support your favorite creators"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Build Portfolio",
      description: "Track your investments in a Robinhood-style dashboard"
    }
  ];

  const creators = [
    { name: "Emma Dance", category: "Dance", gains: "+55%", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
    { name: "Joe Talks", category: "Podcast", gains: "+350%", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    { name: "Sarah Tech", category: "Tech", gains: "+225%", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50">
      {/* Nav */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img 
                src="https://customer-assets.emergentagent.com/job_ideaground/artifacts/iyc80xh6_image.png" 
                alt="ideaGround Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="font-heading font-bold text-xl">ideaGround</span>
            </div>
            <Button 
              data-testid="login-btn-nav"
              onClick={login}
              className="bg-primary text-white hover:bg-primary/90 rounded-full px-6"
            >
              Sign in with Google
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full text-sm font-medium text-accent-foreground">
                <Sparkles className="w-4 h-4" />
                The future of content ownership
              </div>
              <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                Watch. Invest.{" "}
                <span className="gradient-text">Own the Future.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                ideaGround combines the best of social video with stock-trading mechanics. 
                Buy shares of trending videos and grow your portfolio as creators succeed.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  data-testid="get-started-btn"
                  onClick={login}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20"
                >
                  Get Started Free
                  <ArrowRight className={`ml-2 w-5 h-5 transition-transform ${isHovering ? 'translate-x-1' : ''}`} />
                </Button>
                <Button 
                  data-testid="watch-demo-btn"
                  variant="outline"
                  onClick={() => setShowDemo(true)}
                  className="rounded-full px-8 py-6 text-lg font-medium border-2 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                >
                  <Play className="w-5 h-5 mr-2 text-orange-500" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {creators.map((creator, i) => (
                    <img 
                      key={i}
                      src={creator.image} 
                      alt={creator.name}
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">2M+</span> creators already earning
                </p>
              </div>
            </div>

            {/* Hero Card */}
            <div className="relative">
              <div className="bg-card rounded-3xl shadow-2xl shadow-black/10 p-8 border border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-muted-foreground">Trending Creators</span>
                  <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">Live</span>
                </div>
                <div className="space-y-4">
                  {creators.map((creator, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={creator.image} 
                          alt={creator.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-medium">{creator.name}</p>
                          <p className="text-sm text-muted-foreground">{creator.category}</p>
                        </div>
                      </div>
                      <span className="text-secondary font-mono font-medium">{creator.gains}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Your starting balance</span>
                    <span className="font-heading font-bold text-2xl">$500.00</span>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -z-10 top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
              <div className="absolute -z-10 bottom-10 -left-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A revolutionary platform where entertainment meets investment
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-12 text-center text-white">
            <div className="relative z-10">
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
                Ready to own the future?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Join thousands of investors discovering the next viral content
              </p>
              <Button 
                data-testid="cta-get-started-btn"
                onClick={login}
                className="bg-white text-primary hover:bg-white/90 rounded-full px-8 py-6 text-lg font-medium"
              >
                Start with $500 Free
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_ideaground/artifacts/iyc80xh6_image.png" 
              alt="ideaGround Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="font-heading font-bold text-xl">ideaGround</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 ideaGround. Democratizing video ownership.
          </p>
        </div>
      </footer>
    </div>
  );
}
