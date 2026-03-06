import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { 
  Play, TrendingUp, DollarSign, Users, PieChart,
  ArrowRight, ArrowLeft, Sparkles, CheckCircle2, Zap,
  Eye, ShoppingCart, Wallet, BarChart3, Coins
} from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Welcome to ideaGround",
    subtitle: "Where content meets investment",
    description: "ideaGround is a revolutionary platform that lets you invest in videos like stocks. Watch content grow, earn real returns, and support creators you believe in.",
    icon: Sparkles,
    visual: "welcome",
    highlights: ["Buy shares in videos", "Earn as content grows", "Support creators directly"]
  },
  {
    id: 2,
    title: "Discover & Browse",
    subtitle: "Find content worth investing in",
    description: "Browse trending videos, explore different categories, and discover creators with high growth potential. Our algorithm surfaces the best investment opportunities.",
    icon: Eye,
    visual: "discover",
    highlights: ["Trending feed", "Category filters", "Creator profiles"]
  },
  {
    id: 3,
    title: "Buy Video Shares",
    subtitle: "$5 per share, simple and fair",
    description: "Found a video you believe in? Buy shares instantly at a fixed $5 per share. No complex pricing — just straightforward support for creators you believe in.",
    icon: ShoppingCart,
    visual: "buy",
    highlights: ["Fixed $5 per share", "Instant transactions", "No hidden fees"]
  },
  {
    id: 4,
    title: "Track Your Portfolio",
    subtitle: "See all your holdings at a glance",
    description: "Your personalized dashboard shows all your investments and portfolio performance. Track which creators you've backed and how many shares you hold.",
    icon: PieChart,
    visual: "portfolio",
    highlights: ["All holdings in one place", "Share counts tracked", "Easy to manage"]
  },
  {
    id: 6,
    title: "Fair Revenue Sharing",
    subtitle: "Everyone wins together",
    description: "When videos earn revenue, it's split fairly: 80% to creators, 10% to shareholders, and 10% to the service provider. True community ownership.",
    icon: Coins,
    visual: "revenue",
    highlights: ["80% to creators", "10% to shareholders", "Transparent payouts"]
  },
  {
    id: 7,
    title: "Ready to Start?",
    subtitle: "Your journey begins now",
    description: "Sign up for free and receive $500 in virtual credits to start investing. Explore the platform, buy your first shares, and join the content revolution!",
    icon: Zap,
    visual: "start",
    highlights: ["$500 free credits", "No credit card needed", "Start earning today"]
  }
];

// Visual components for each slide - consistent orange theme
const SlideVisual = ({ type }) => {
  const card = "w-full max-w-[280px] mx-auto bg-white rounded-2xl shadow-lg border border-orange-100 p-5";

  switch (type) {
    case 'welcome':
      return (
        <div className={card}>
          <div className="flex flex-col items-center gap-4">
            <span className="font-heading font-bold text-xl text-gray-800">ideaGround</span>
            <div className="flex gap-3 w-full">
              {[TrendingUp, DollarSign, Users].map((Icon, i) => (
                <div key={i} className="flex-1 bg-orange-50 border border-orange-100 rounded-xl py-3 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-orange-500" />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center">Content meets investment</p>
          </div>
        </div>
      );

    case 'discover':
      return (
        <div className="w-full max-w-[280px] mx-auto grid grid-cols-2 gap-3">
          {[
            { views: "1.2M", price: "$12.50" },
            { views: "850K", price: "$8.75" },
            { views: "2.1M", price: "$18.00" },
            { views: "500K", price: "$5.25" }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md border border-orange-50 overflow-hidden">
              <div className="aspect-video bg-orange-50 flex items-center justify-center relative">
                <Play className="w-6 h-6 text-orange-400" />
                <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                  {item.views}
                </div>
              </div>
              <div className="p-2 text-center">
                <span className="text-sm font-bold text-orange-600">{item.price}</span>
              </div>
            </div>
          ))}
        </div>
      );

    case 'buy':
      return (
        <div className={card}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <Play className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Viral Dance Video</p>
              <p className="text-xs text-gray-500">@ideaGround</p>
            </div>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Share Price</span>
              <span className="text-xs text-orange-500 font-medium">Fixed</span>
            </div>
            <span className="text-2xl font-bold text-orange-600">$5.00</span>
          </div>
          <div className="flex items-center justify-between mb-4 text-sm">
            <span className="text-gray-500">Quantity</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 font-bold flex items-center justify-center">-</div>
              <span className="font-bold text-gray-800 w-6 text-center">10</span>
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 font-bold flex items-center justify-center">+</div>
            </div>
          </div>
          <div className="bg-orange-500 text-white text-center py-2.5 rounded-xl font-bold text-sm">
            Buy for $50.00
          </div>
        </div>
      );

    case 'portfolio':
      return (
        <div className={card}>
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 mb-1">Shares Held</p>
            <p className="text-2xl font-bold text-gray-800">490 shares</p>
            <div className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-medium mt-2">
              Value: $2,450.00
            </div>
          </div>
          <div className="h-20 flex items-end justify-between gap-1 mb-2">
            {[40, 55, 45, 70, 65, 85, 80].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Today"].map(d => <span key={d}>{d}</span>)}
          </div>
        </div>
      );

    case 'revenue':
      return (
        <div className={card}>
          <div className="relative w-28 h-28 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="14" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="14"
                strokeDasharray="201.0 251.2" strokeDashoffset="0" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#fb923c" strokeWidth="14"
                strokeDasharray="25.1 251.2" strokeDashoffset="-201.0" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#fed7aa" strokeWidth="14"
                strokeDasharray="25.1 251.2" strokeDashoffset="-226.1" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Coins className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div className="space-y-2">
            {[
              { color: "bg-orange-500", label: "Creators", pct: "80%" },
              { color: "bg-orange-400", label: "Investors", pct: "10%" },
              { color: "bg-orange-200", label: "Community", pct: "10%" },
            ].map(({ color, label, pct }) => (
              <div key={label} className="flex items-center justify-between px-3 py-2 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
                <span className="font-bold text-orange-600 text-sm">{pct}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'start':
      return (
        <div className={card}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-orange-500">$500</div>
            <p className="text-sm text-gray-500">Free Starting Credits</p>
            <div className="w-full space-y-2">
              {["No credit card needed", "Start earning today", "Join the revolution"].map(t => (
                <div key={t} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>
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
      <DialogContent className="sm:max-w-2xl p-0 bg-white border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-orange-200 z-10">
          <div 
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>
        
        <div className="grid md:grid-cols-2 md:min-h-[520px]">
          {/* Left side - Visual */}
          <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 p-6 md:p-8 flex items-center justify-center relative overflow-hidden min-h-[200px] md:min-h-0">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-orange-400/30 rounded-full blur-3xl"></div>
            
            <SlideVisual type={slide.visual} />
          </div>
          
          {/* Right side - Content */}
          <div className="p-6 md:p-8 flex flex-col justify-between bg-white">
            <div>
              {/* Icon & Step */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
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
              <p className="text-orange-500 font-semibold mb-4">{slide.subtitle}</p>
              <p className="text-gray-600 leading-relaxed mb-6">{slide.description}</p>
              
              {/* Highlights */}
              <div className="space-y-3">
                {slide.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-orange-500" />
                    </div>
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
                    className={`h-2 rounded-full transition-all ${
                      i === currentSlide 
                        ? 'w-8 bg-orange-500' 
                        : 'w-2 bg-orange-200 hover:bg-orange-300'
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
                    className="flex-1 rounded-full border-orange-200 hover:bg-orange-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                
                {currentSlide < slides.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
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
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
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
                  className="w-full text-center text-sm text-gray-400 hover:text-orange-500 mt-4 transition-colors"
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
