import { 
  TrendingUp, Users, DollarSign, Shield, Zap, Heart,
  PiggyBank, Award, BarChart3, Lock, Sparkles, ArrowRight,
  CheckCircle2, XCircle, Scale, Coins, HandCoins, Share2,
  Brain, Lightbulb, Target, Globe, Rocket
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

export default function WhyIdeaGround() {
  const problems = [
    {
      icon: XCircle,
      title: "Creators get pennies",
      description: "Traditional platforms take 45-55% of ad revenue, leaving creators with scraps"
    },
    {
      icon: XCircle,
      title: "Fans get nothing",
      description: "You watch, like, share - but receive zero financial benefit from helping content grow"
    },
    {
      icon: XCircle,
      title: "Early supporters ignored",
      description: "Discovered a creator before they blew up? Too bad - no reward for your early faith"
    },
    {
      icon: XCircle,
      title: "Unfair algorithms",
      description: "Black-box algorithms decide who succeeds, not genuine community support"
    }
  ];

  const solutions = [
    {
      icon: Coins,
      title: "Creators keep more",
      description: "50% of video revenue goes directly to creators - no hidden fees or complicated terms",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: HandCoins,
      title: "Fans earn too",
      description: "40% of revenue is shared with shareholders - your support literally pays off",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Award,
      title: "Early discovery bonus",
      description: "First believers get up to 2x multiplier on profits - we reward vision, not just luck",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Scale,
      title: "Transparent & fair",
      description: "Every transaction, every split, every payout - completely visible and verifiable",
      color: "from-blue-500 to-indigo-500"
    }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: "Video Stock Market",
      description: "Buy and sell shares in videos you believe in. Prices rise with popularity - sell for profit anytime.",
      stat: "Real-time pricing"
    },
    {
      icon: PiggyBank,
      title: "Invest in Content",
      description: "Turn your media consumption into investment opportunities. Back creators you love.",
      stat: "Starting at $1"
    },
    {
      icon: Award,
      title: "Early Investor Rewards",
      description: "Be among the first 100 shareholders and earn bonus multipliers on your profits.",
      stat: "Up to 2x bonus"
    },
    {
      icon: BarChart3,
      title: "Portfolio Tracking",
      description: "Track your investments, monitor performance, and make data-driven decisions.",
      stat: "Live analytics"
    },
    {
      icon: Share2,
      title: "Revenue Sharing",
      description: "When videos earn, everyone earns. Fair 50/40/10 split between creators, investors, and platform.",
      stat: "50% to creators"
    },
    {
      icon: Lock,
      title: "Secure & Transparent",
      description: "Every transaction recorded, every payout traceable. Full visibility into your investments.",
      stat: "100% transparent"
    }
  ];

  const comparison = [
    { feature: "Creator revenue share", traditional: "45-55%", ideaground: "80% (can sell 30% stake)" },
    { feature: "Fan earnings", traditional: "0%", ideaground: "10% → 40% of revenue" },
    { feature: "Early supporter rewards", traditional: "None", ideaground: "Up to 2x bonus" },
    { feature: "Revenue transparency", traditional: "Hidden", ideaground: "Fully visible" },
    { feature: "Investment opportunity", traditional: "None", ideaground: "Buy video shares" },
    { feature: "Community ownership", traditional: "Platform-owned", ideaground: "Shared ownership" }
  ];

  return (
    <div className="page-enter min-h-screen orange-gradient-subtle">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative p-8 lg:p-12 max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Redefining Social Media Economics
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Why <span className="gradient-text">ideaGround</span>?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Traditional platforms profit from your content and attention while giving nothing back. 
              We built ideaGround to flip that script - where <strong className="text-foreground">everyone who contributes, earns</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* The Problem Section */}
      <div className="px-8 lg:px-12 max-w-7xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold mb-4">The Problem with Today&apos;s Platforms</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Social media created a system where platforms win, creators struggle, and fans get nothing
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {problems.map((problem, index) => (
            <Card key={index} className="border-destructive/20 bg-destructive/5 card-hover-orange">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                  <problem.icon className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{problem.title}</h3>
                <p className="text-sm text-muted-foreground">{problem.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* The Solution Section */}
      <div className="px-8 lg:px-12 max-w-7xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold mb-4">The ideaGround Solution</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We built a platform where value flows fairly to everyone who creates it
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 stagger-children">
          {solutions.map((solution, index) => (
            <Card key={index} className="border-border/50 overflow-hidden card-hover-orange group">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  <div className={`w-2 bg-gradient-to-b ${solution.color}`}></div>
                  <div className="flex-1 p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${solution.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                        <solution.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-xl mb-2">{solution.title}</h3>
                        <p className="text-muted-foreground">{solution.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Revenue Split Visualization */}
      <div className="px-8 lg:px-12 max-w-7xl mx-auto mb-20">
        <Card className="border-border/50 overflow-hidden">
          <CardContent className="p-8 lg:p-12">
            <div className="text-center mb-10">
              <h2 className="font-heading text-3xl font-bold mb-4">Fair Revenue Distribution</h2>
              <p className="text-muted-foreground">Every dollar earned is split transparently</p>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              {/* Visual Bar */}
              <div className="w-full lg:w-2/3">
                <div className="h-16 rounded-2xl overflow-hidden flex shadow-lg">
                  <div className="w-[80%] bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Creators 80%</span>
                  </div>
                  <div className="w-[10%] bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">10%</span>
                  </div>
                  <div className="w-[10%] bg-gradient-to-r from-slate-500 to-slate-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">10%</span>
                  </div>
                </div>
                <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                  <span>Content creators get the largest share</span>
                  <span>Fans & community share the rest</span>
                </div>
              </div>
              
              {/* Legend */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-orange-500 to-orange-600"></div>
                  <span className="font-medium">Creators - Build the content</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  <span className="font-medium">Investors - Fund the growth</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-slate-500 to-slate-600"></div>
                  <span className="font-medium">Community - Protocol stewards</span>
                </div>
              </div>
            </div>
            
            {/* Investor Definition */}
            <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
              <p className="text-sm text-emerald-800 leading-relaxed">
                <strong className="text-emerald-900">💰 Investors (10% → 40%):</strong> You spot a rising star. You invest early. As the creator grows and chooses to unlock more shares for fans, your slice of the pie grows too — from 10% up to 40%. 
                <span className="font-medium"> Early believers win big.</span>
              </p>
            </div>
            
            {/* Community Definition */}
            <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Community (10%):</strong> Protocol participants who contribute effort, not capital — 
                <span className="text-slate-700"> Curators</span> (discover quality), 
                <span className="text-slate-700"> Validators</span> (audit metrics), 
                <span className="text-slate-700"> Market Makers</span> (provide liquidity), and 
                <span className="text-slate-700"> Governance</span> (vote on rules).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <div className="px-8 lg:px-12 max-w-7xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold mb-4">ideaGround vs Traditional Platforms</h2>
          <p className="text-muted-foreground">See the difference fair economics makes</p>
        </div>
        
        <Card className="border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-4 font-heading font-semibold">Feature</th>
                  <th className="text-center p-4 font-heading font-semibold text-muted-foreground">Traditional</th>
                  <th className="text-center p-4 font-heading font-semibold gradient-text">ideaGround</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, index) => (
                  <tr key={index} className="border-t border-border/50 hover:bg-accent/50 transition-colors">
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <XCircle className="w-4 h-4 text-destructive" />
                        {row.traditional}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-2 text-secondary font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        {row.ideaground}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="px-8 lg:px-12 max-w-7xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold mb-4">Platform Features</h2>
          <p className="text-muted-foreground">Everything you need to invest in content</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 card-hover-orange group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-heading font-semibold">{feature.title}</h3>
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {feature.stat}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="px-8 lg:px-12 max-w-7xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground">Simple steps to start earning</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "1", title: "Discover", desc: "Browse videos and find content you believe in" },
            { step: "2", title: "Invest", desc: "Buy shares in videos - starting from just $1" },
            { step: "3", title: "Grow", desc: "Watch your investment grow as videos gain popularity" },
            { step: "4", title: "Earn", desc: "Sell shares for profit or earn from revenue sharing" }
          ].map((item, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg orange-glow">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              {index < 3 && (
                <ArrowRight className="hidden md:block absolute top-8 -right-3 w-6 h-6 text-orange-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-8 lg:px-12 max-w-7xl mx-auto pb-20">
        <Card className="border-0 bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden">
          <CardContent className="p-12 text-center relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            <div className="relative">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to invest in content you love?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                Join the revolution. Be an early investor, support creators, and earn your fair share.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/explore">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90 rounded-full px-8 py-6 text-lg font-semibold shadow-lg">
                    Start Exploring
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
