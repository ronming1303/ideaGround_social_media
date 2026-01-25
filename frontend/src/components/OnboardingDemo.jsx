import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { 
  Play, TrendingUp, DollarSign, Award, Users, PieChart,
  ArrowRight, ArrowLeft, X, Sparkles, CheckCircle2, Zap,
  Eye, ShoppingCart, Wallet, BarChart3
} from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Welcome to ideaGround",
    subtitle: "Where content meets investment",
    description: "ideaGround is a revolutionary platform that lets you invest in videos like stocks. Watch content grow, earn real returns, and support creators you believe in.",
    icon: Sparkles,
    color: "from-orange-500 to-amber-500",
    visual: "welcome",
    highlights: ["Buy shares in videos", "Earn as content grows", "Support creators directly"]
  },
  {
    id: 2,
    title: "Discover & Browse",
    subtitle: "Find content worth investing in",
    description: "Browse trending videos, explore different categories, and discover creators with high growth potential. Our algorithm surfaces the best investment opportunities.",
    icon: Eye,
    color: "from-blue-500 to-indigo-500",
    visual: "discover",
    highlights: ["Trending feed", "Category filters", "Creator profiles"]
  },
  {
    id: 3,
    title: "Buy Video Shares",
    subtitle: "Invest starting from just $1",
    description: "Found a video you believe in? Buy shares instantly. Prices are determined by popularity - the more people watch and engage, the higher your shares go.",
    icon: ShoppingCart,
    color: "from-emerald-500 to-teal-500",
    visual: "buy",
    highlights: ["Real-time pricing", "Instant transactions", "No hidden fees"]
  },
  {
    id: 4,
    title: "Early Investor Bonus",
    subtitle: "Get rewarded for discovering early",
    description: "Be among the first 100 investors in a video and earn up to 2x bonus on your profits. We reward those who discover great content before it goes viral.",
    icon: Award,
    color: "from-purple-500 to-pink-500",
    visual: "bonus",
    highlights: ["First 10 investors: 2x bonus", "First 50 investors: 1.5x bonus", "First 100 investors: 1.25x bonus"]
  },
  {
    id: 5,
    title: "Track Your Portfolio",
    subtitle: "Monitor performance in real-time",
    description: "Your personalized dashboard shows all your investments, gains, and portfolio performance. Watch your wealth grow as the videos you backed succeed.",
    icon: PieChart,
    color: "from-cyan-500 to-blue-500",
    visual: "portfolio",
    highlights: ["Live price updates", "Gain/loss tracking", "Historical charts"]
  },
  {
    id: 6,
    title: "Fair Revenue Sharing",
    subtitle: "Everyone wins together",
    description: "When videos earn revenue, it's split fairly: 50% to creators, 40% to shareholders (you!), and just 10% to the platform. True community ownership.",
    icon: DollarSign,
    color: "from-orange-500 to-red-500",
    visual: "revenue",
    highlights: ["50% to creators", "40% to investors", "Transparent payouts"]
  },
  {
    id: 7,
    title: "Ready to Start?",
    subtitle: "Your journey begins now",
    description: "Sign up for free and receive $500 in virtual credits to start investing. Explore the platform, buy your first shares, and join the content revolution!",
    icon: Zap,
    color: "from-orange-500 to-orange-600",
    visual: "start",
    highlights: ["$500 free credits", "No credit card needed", "Start earning today"]
  }
];

// Visual components for each slide
const SlideVisual = ({ type, isActive }) => {
  const baseClass = `transition-all duration-700 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`;
  
  switch (type) {
    case 'welcome':
      return (
        <div className={`${baseClass} relative`}>
          <div className="w-64 h-64 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-3xl animate-pulse"></div>
            <div className="absolute inset-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
              <img 
                src="https://customer-assets.emergentagent.com/job_ideaground/artifacts/iyc80xh6_image.png" 
                alt="ideaGround" 
                className="w-24 h-24 object-contain"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg animate-bounce">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg animate-bounce delay-100">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      );
    
    case 'discover':
      return (
        <div className={`${baseClass} grid grid-cols-2 gap-3 max-w-xs mx-auto`}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`aspect-video bg-gradient-to-br ${i === 1 ? 'from-orange-400 to-orange-500' : i === 2 ? 'from-blue-400 to-blue-500' : i === 3 ? 'from-purple-400 to-purple-500' : 'from-emerald-400 to-emerald-500'} rounded-xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform`}>
              <Play className="w-8 h-8 text-white/80" />
            </div>
          ))}
        </div>
      );
    
    case 'buy':
      return (
        <div className={`${baseClass} max-w-xs mx-auto`}>
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl"></div>
              <div>
                <p className="font-semibold text-sm">Viral Dance Video</p>
                <p className="text-xs text-gray-500">@emma_dance</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-emerald-600">$12.50</span>
              <span className="text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+25%</span>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-3 rounded-xl font-semibold">
              Buy 10 Shares
            </div>
          </div>
        </div>
      );
    
    case 'bonus':
      return (
        <div className={`${baseClass} max-w-xs mx-auto`}>
          <div className="space-y-3">
            {[
              { rank: "Top 10", bonus: "2x", color: "from-amber-400 to-amber-500" },
              { rank: "Top 50", bonus: "1.5x", color: "from-gray-300 to-gray-400" },
              { rank: "Top 100", bonus: "1.25x", color: "from-orange-300 to-orange-400" }
            ].map((tier, i) => (
              <div key={i} className={`flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${tier.color} text-white shadow-lg transform hover:scale-102 transition-transform`}>
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6" />
                  <span className="font-semibold">{tier.rank} Investor</span>
                </div>
                <span className="text-xl font-bold">{tier.bonus}</span>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'portfolio':
      return (
        <div className={`${baseClass} max-w-xs mx-auto`}>
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">Portfolio Value</p>
              <p className="text-3xl font-bold text-gray-900">$2,450.00</p>
              <p className="text-sm text-emerald-600">+$450.00 (22.5%)</p>
            </div>
            <div className="h-20 flex items-end justify-between gap-1">
              {[40, 55, 45, 70, 65, 80, 75].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Mon</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      );
    
    case 'revenue':
      return (
        <div className={`${baseClass} max-w-xs mx-auto`}>
          <div className="h-8 rounded-full overflow-hidden flex shadow-lg">
            <div className="w-[50%] bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">Creators 50%</span>
            </div>
            <div className="w-[40%] bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">You 40%</span>
            </div>
            <div className="w-[10%] bg-gradient-to-r from-gray-400 to-gray-500"></div>
          </div>
          <div className="mt-6 space-y-3">
            {[
              { label: "Creators", percent: "50%", icon: Users, color: "text-orange-500" },
              { label: "Investors (You)", percent: "40%", icon: Wallet, color: "text-emerald-500" },
              { label: "Platform", percent: "10%", icon: BarChart3, color: "text-gray-400" }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className={`font-bold ${item.color}`}>{item.percent}</span>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'start':
      return (
        <div className={`${baseClass} text-center`}>
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl animate-pulse"></div>
            <div className="absolute inset-2 bg-white rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-bold text-orange-500">$500</span>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-700">Free Starting Credits</p>
          <p className="text-sm text-gray-500 mt-1">No credit card required</p>
        </div>
      );
    
    default:
      return null;
  }
};

export default function OnboardingDemo({ open, onOpenChange, onGetStarted }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Auto-advance slides
  useEffect(() => {
    if (!open || !isAutoPlaying) return;
    
    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(prev => prev + 1);
      } else {
        setIsAutoPlaying(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [currentSlide, open, isAutoPlaying]);
  
  // Reset on open
  useEffect(() => {
    if (open) {
      setCurrentSlide(0);
      setIsAutoPlaying(true);
    }
  }, [open]);
  
  const handleNext = () => {
    setIsAutoPlaying(false);
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    setIsAutoPlaying(false);
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };
  
  const handleDotClick = (index) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
  };
  
  const slide = slides[currentSlide];
  const Icon = slide.icon;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-white border-0 shadow-2xl">
        {/* Close button */}
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
        
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 z-10">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>
        
        <div className="grid md:grid-cols-2 min-h-[500px]">
          {/* Left side - Visual */}
          <div className={`bg-gradient-to-br ${slide.color} p-8 flex items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            <SlideVisual type={slide.visual} isActive={true} />
          </div>
          
          {/* Right side - Content */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              {/* Icon & Step */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${slide.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-400">
                  Step {currentSlide + 1} of {slides.length}
                </span>
              </div>
              
              {/* Title & Description */}
              <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">
                {slide.title}
              </h2>
              <p className="text-orange-600 font-medium mb-4">{slide.subtitle}</p>
              <p className="text-gray-600 leading-relaxed mb-6">{slide.description}</p>
              
              {/* Highlights */}
              <div className="space-y-2">
                {slide.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation */}
            <div className="mt-8">
              {/* Dots */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleDotClick(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentSlide 
                        ? 'w-8 bg-orange-500' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              
              {/* Buttons */}
              <div className="flex gap-3">
                {currentSlide > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    className="flex-1 rounded-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                
                {currentSlide < slides.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      onOpenChange(false);
                      if (onGetStarted) onGetStarted();
                    }}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700"
                  >
                    Get Started Free
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
              
              {/* Skip */}
              {currentSlide < slides.length - 1 && (
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4 transition-colors"
                >
                  Skip tutorial
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
