import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { 
  Play, TrendingUp, DollarSign, Award, Users, PieChart,
  ArrowRight, ArrowLeft, X, Sparkles, CheckCircle2, Zap,
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
    subtitle: "Invest starting from just $1",
    description: "Found a video you believe in? Buy shares instantly. Prices are determined by popularity - the more people watch and engage, the higher your shares go.",
    icon: ShoppingCart,
    visual: "buy",
    highlights: ["Real-time pricing", "Instant transactions", "No hidden fees"]
  },
  {
    id: 4,
    title: "Early Investor Bonus",
    subtitle: "Get rewarded for discovering early",
    description: "Be among the first 100 investors in a video and earn up to 2x bonus on your profits. We reward those who discover great content before it goes viral.",
    icon: Award,
    visual: "bonus",
    highlights: ["First 10 investors: 2x bonus", "First 50 investors: 1.5x bonus", "First 100 investors: 1.25x bonus"]
  },
  {
    id: 5,
    title: "Track Your Portfolio",
    subtitle: "Monitor performance in real-time",
    description: "Your personalized dashboard shows all your investments, gains, and portfolio performance. Watch your wealth grow as the videos you backed succeed.",
    icon: PieChart,
    visual: "portfolio",
    highlights: ["Live price updates", "Gain/loss tracking", "Historical charts"]
  },
  {
    id: 6,
    title: "Fair Revenue Sharing",
    subtitle: "Everyone wins together",
    description: "When videos earn revenue, it's split fairly: 50% to creators, 40% to shareholders (you!), and just 10% to the platform. True community ownership.",
    icon: Coins,
    visual: "revenue",
    highlights: ["50% to creators", "40% to investors", "Transparent payouts"]
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
const SlideVisual = ({ type, isActive }) => {
  const baseClass = `transition-all duration-700 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`;
  
  switch (type) {
    case 'welcome':
      return (
        <div className={`${baseClass} relative`}>
          <div className="w-56 h-56 mx-auto relative">
            {/* Animated rings */}
            <div className="absolute inset-0 border-4 border-white/20 rounded-3xl animate-pulse"></div>
            <div className="absolute inset-4 border-2 border-white/30 rounded-2xl"></div>
            {/* Logo card */}
            <div className="absolute inset-8 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
              <img 
                src="https://customer-assets.emergentagent.com/job_ideaground/artifacts/iyc80xh6_image.png" 
                alt="ideaGround" 
                className="w-20 h-20 object-contain"
              />
            </div>
            {/* Floating badges */}
            <div className="absolute -top-2 -right-2 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
              <TrendingUp className="w-7 h-7 text-orange-500" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl animate-bounce" style={{ animationDelay: '0.2s' }}>
              <DollarSign className="w-7 h-7 text-orange-500" />
            </div>
          </div>
        </div>
      );
    
    case 'discover':
      return (
        <div className={`${baseClass}`}>
          <div className="grid grid-cols-2 gap-4 max-w-[280px] mx-auto">
            {[
              { views: "1.2M", price: "$12.50" },
              { views: "850K", price: "$8.75" },
              { views: "2.1M", price: "$18.00" },
              { views: "500K", price: "$5.25" }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform">
                <div className="aspect-video bg-gradient-to-br from-orange-200 to-orange-100 flex items-center justify-center relative">
                  <Play className="w-8 h-8 text-orange-500/60" />
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                    {item.views}
                  </div>
                </div>
                <div className="p-2 text-center">
                  <span className="text-sm font-bold text-orange-600">{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'buy':
      return (
        <div className={`${baseClass} max-w-[260px] mx-auto`}>
          <div className="bg-white rounded-2xl shadow-2xl p-5 border-2 border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                <Play className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Viral Dance Video</p>
                <p className="text-xs text-gray-500">@emma_dance</p>
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Share Price</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-orange-500 font-medium">+25%</span>
                </div>
              </div>
              <span className="text-3xl font-bold text-orange-600">$12.50</span>
            </div>
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-gray-500">Quantity</span>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 font-bold">-</button>
                <span className="font-bold text-gray-800 w-8 text-center">10</span>
                <button className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 font-bold">+</button>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-3 rounded-xl font-bold shadow-lg">
              Buy for $125.00
            </div>
          </div>
        </div>
      );
    
    case 'bonus':
      return (
        <div className={`${baseClass} max-w-[280px] mx-auto`}>
          <div className="space-y-3">
            {[
              { rank: "Top 10", bonus: "2x", icon: "🥇", bg: "from-amber-400 to-yellow-500" },
              { rank: "Top 50", bonus: "1.5x", icon: "🥈", bg: "from-gray-300 to-gray-400" },
              { rank: "Top 100", bonus: "1.25x", icon: "🥉", bg: "from-orange-400 to-orange-500" }
            ].map((tier, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-xl p-4 flex items-center justify-between transform hover:scale-102 transition-transform border-2 border-orange-100">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.bg} flex items-center justify-center shadow-lg`}>
                    <span className="text-xl">{tier.icon}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">{tier.rank} Investor</span>
                    <p className="text-xs text-gray-500">Early discovery reward</p>
                  </div>
                </div>
                <div className="bg-orange-100 px-3 py-2 rounded-xl">
                  <span className="text-xl font-bold text-orange-600">{tier.bonus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'portfolio':
      return (
        <div className={`${baseClass} max-w-[280px] mx-auto`}>
          <div className="bg-white rounded-2xl shadow-2xl p-5 border-2 border-orange-100">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500 mb-1">Portfolio Value</p>
              <p className="text-3xl font-bold text-gray-800">$2,450<span className="text-lg">.00</span></p>
              <div className="inline-flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium mt-2">
                <TrendingUp className="w-4 h-4" />
                +$450.00 (22.5%)
              </div>
            </div>
            <div className="h-24 flex items-end justify-between gap-1 mb-2">
              {[40, 55, 45, 70, 65, 85, 80].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-lg shadow-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      );
    
    case 'revenue':
      return (
        <div className={`${baseClass} max-w-[300px] mx-auto`}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-orange-100">
            {/* Donut chart visual */}
            <div className="relative w-40 h-40 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                {/* Creators - 50% */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="12" 
                  strokeDasharray="125.6 251.2" strokeDashoffset="0" strokeLinecap="round" />
                {/* Investors - 40% */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#fb923c" strokeWidth="12" 
                  strokeDasharray="100.5 251.2" strokeDashoffset="-125.6" strokeLinecap="round" />
                {/* Platform - 10% */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#fed7aa" strokeWidth="12" 
                  strokeDasharray="25.1 251.2" strokeDashoffset="-226.1" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Coins className="w-8 h-8 text-orange-500 mx-auto mb-1" />
                  <span className="text-xs text-gray-500">Revenue</span>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium text-gray-700">Creators</span>
                </div>
                <span className="font-bold text-orange-600">50%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-400"></div>
                  <span className="text-sm font-medium text-gray-700">Investors (You)</span>
                </div>
                <span className="font-bold text-orange-500">40%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-200"></div>
                  <span className="text-sm font-medium text-gray-700">Platform</span>
                </div>
                <span className="font-bold text-gray-500">10%</span>
              </div>
            </div>
          </div>
        </div>
      );
    
    case 'start':
      return (
        <div className={`${baseClass} text-center`}>
          <div className="relative">
            {/* Animated glow */}
            <div className="absolute inset-0 w-40 h-40 mx-auto bg-white/30 rounded-3xl blur-xl animate-pulse"></div>
            {/* Card */}
            <div className="relative w-40 h-40 mx-auto mb-4">
              <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl border-2 border-orange-200"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-orange-500">$500</span>
                <span className="text-sm text-gray-500 mt-1">FREE</span>
              </div>
            </div>
          </div>
          <p className="text-lg font-bold text-white mt-4">Free Starting Credits</p>
          <p className="text-sm text-white/80 mt-1">No credit card required</p>
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
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
        
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-orange-200 z-10">
          <div 
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>
        
        <div className="grid md:grid-cols-2 min-h-[520px]">
          {/* Left side - Visual (consistent orange gradient) */}
          <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 p-8 flex items-center justify-center relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-orange-400/30 rounded-full blur-3xl"></div>
            
            <SlideVisual type={slide.visual} isActive={true} />
          </div>
          
          {/* Right side - Content */}
          <div className="p-8 flex flex-col justify-between bg-white">
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
