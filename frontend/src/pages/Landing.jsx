import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Play, TrendingUp, Users, DollarSign, ArrowRight, Sparkles, BarChart3, Menu, X } from "lucide-react";
import OnboardingDemo from "../components/OnboardingDemo";

const solutions = [
  {
    num: "01",
    slug: "inequality",
    title: "Inequality",
    color: "bg-[#dde0f7]",
    summary: "On most social media platforms, various forms of inequality persist, affecting different groups within the community.",
  },
  {
    num: "02",
    slug: "intellectual-property",
    title: "Intellectual Property",
    color: "bg-[#f0f0f0]",
    summary: "In this digital age, user’s words, ideas, and creations are their intellectual properties. However, these valuable assets are increasingly under threat.",
  },
  {
    num: "03",
    slug: "censorship",
    title: "Censorship",
    color: "bg-[#fde8d8]",
    summary: "Social media faces significant censorship and state control, especially in authoritarian regimes.",
  },
  {
    num: "04",
    slug: "privacy",
    title: "Privacy",
    color: "bg-[#d8f5e8]",
    summary: "One of the most significant issues with social media is the erosion of user privacy. It raises serious concerns about privacy and surveillance.",
  },
];

export default function Landing() {
  const { login, user } = useAuth();
  const [isHovering, setIsHovering] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  const handleContact = (e) => {
    e.preventDefault();
    window.location.href = `mailto:info@ideaground.net?subject=Contact from ${contactForm.firstName} ${contactForm.lastName}&body=${encodeURIComponent(contactForm.message)}%0A%0APhone: ${contactForm.phone}%0AEmail: ${contactForm.email}`;
    setContactSent(true);
  };

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
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-xl gradient-text">ideaGround</span>
                {process.env.REACT_APP_ENV === 'staging' && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-500 border border-yellow-500/30">DEV</span>
                )}
                {process.env.REACT_APP_ENV === 'development' && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-400/20 text-blue-500 border border-blue-500/30">LOCAL</span>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-1">
                {["home", "about", "solutions", "resources", "contact"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                      activeTab === tab
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Hamburger button - mobile only */}
              <button
                className="sm:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
                onClick={() => setMobileMenuOpen(o => !o)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              {user && (
                <Link
                  to="/investors"
                  className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  Investor Metrics
                </Link>
              )}
              <Button 
                data-testid="login-btn-nav"
                onClick={login}
                className="bg-primary text-white hover:bg-primary/90 rounded-full px-6"
              >
                Sign in with Google
              </Button>
            </div>
          </div>
        </div>
        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-black/5 bg-white/95 backdrop-blur-md px-4 py-3 flex flex-col gap-1">
            {["home", "about", "solutions", "resources", "contact"].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Solutions Tab */}
      {activeTab === "solutions" && (
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-center mb-10">
              Read our solutions for every sector
            </h1>
            <div className="text-base text-foreground space-y-4 mb-12 leading-relaxed">
              <p>
                Social media makes significant changes to our life, but it{" "}
                <span className="text-primary font-medium">brings problems</span>{" "}
                that have become increasingly evident in recent years.
              </p>
              <p>
                The solution is designing a novel mechanism to achieve desirable{" "}
                <span className="text-primary font-medium">social and economic outcomes</span>{" "}
                given the constraints of users'{" "}
                <span className="text-primary font-medium">self-interest</span>.
              </p>
              <p>
                The solution is{" "}
                <span className="text-primary font-medium">ideaGround Social Media Economics</span>
                . It applies principles from economic game theory, computer science, management, and finance.
              </p>
              <p>Read our solutions to these problems.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {solutions.map((s) => (
                <div key={s.num} className={`${s.color} rounded-2xl p-8 flex flex-col gap-4`}>
                  <span className="text-3xl font-bold text-foreground/40">{s.num}</span>
                  <h3 className="font-heading text-2xl font-bold">{s.title}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">{s.summary}</p>
                  <Link
                    to={`/solutions/${s.slug}`}
                    className="self-start flex items-center gap-2 bg-white rounded-full px-5 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    Our Solution
                    <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs">→</span>
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Button
                onClick={login}
                className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-medium shadow-lg shadow-orange-500/20"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* About Tab */}
      {activeTab === "about" && (
        <div className="pt-24 pb-20">

          {/* Hero */}
          <div className="px-4 py-16 max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold tracking-widest text-muted-foreground mb-6">ABOUT US</p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-8 leading-tight">
              Building social media that's fair,<br className="hidden md:block" /> transparent, and yours.
            </h1>
            <div className="space-y-4 text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto text-left">
              <p>The ideaGround is building a new kind of social media — fair, transparent, and owned by users.</p>
              <p>We believe value should be earned and shared, not extracted. Powered by social media economics, we reward contribution, protect privacy, and return ownership to the community.</p>
              <p>The ideaGround is not just a platform — it's a movement to take back the internet.</p>
              <p className="font-semibold text-foreground">Join us and take back your digital voice.</p>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="py-16 px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
              {[
                { label: "Mission", text: "Build a fair, transparent and autonomous social media—where value is earned and shared, not exploited." },
                { label: "Vision",  text: "Revolutionize social media monetization through financial incentives, privacy, and decentralized ownership." },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <h2 className="font-heading text-4xl font-bold mb-4">{item.label}</h2>
                  <p className="text-base text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SME Cards */}
          <div className="px-4 py-16 max-w-4xl mx-auto">
            <p className="text-xs font-bold tracking-widest text-muted-foreground text-center mb-10">WHAT WE DELIVER</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { num: "01", title: "We Incentivize Everyone",    desc: "Fair and transparent profit-sharing system for social media users.",                                                                                          color: "bg-[#dde0f7]" },
                { num: "02", title: "We Empower Participants",    desc: "Create a collaborative and self-sustaining ecosystem that puts control back in the hands of the community.",                                                  color: "bg-[#f0f0f0]" },
                { num: "03", title: "We Introduce Smart Pricing", desc: "Financial Engineering models applied effectively to price digital content. A completely new approach to social media monetization.",                          color: "bg-[#fde8d8]" },
                { num: "04", title: "We Offer Sandbox Options",   desc: "A highly customizable and personalized social media experience. Users can use ideaGround to build any form of social media.",                               color: "bg-[#d8f5e8]" },
              ].map(card => (
                <div key={card.num} className={`${card.color} rounded-2xl p-8 flex flex-col gap-4`}>
                  <span className="text-3xl font-bold text-foreground/40">{card.num}</span>
                  <h3 className="font-heading text-2xl font-bold">{card.title}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Contact Tab */}
      {activeTab === "contact" && (
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold tracking-widest text-foreground mb-4">READY TO GET STARTED?</p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-12 leading-tight">
              Discover a new era of social media.<br />
              Reach out to start your journey today.
            </h1>

            {contactSent ? (
              <div className="text-center py-16">
                <p className="text-2xl font-bold mb-2">Message sent!</p>
                <p className="text-muted-foreground">We'll get back to you at {contactForm.email}.</p>
              </div>
            ) : (
              <form onSubmit={handleContact} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">First name <span className="text-destructive">*</span></label>
                    <input
                      required
                      value={contactForm.firstName}
                      onChange={e => setContactForm(f => ({ ...f, firstName: e.target.value }))}
                      className="w-full rounded-full border border-border px-5 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Last name <span className="text-destructive">*</span></label>
                    <input
                      required
                      value={contactForm.lastName}
                      onChange={e => setContactForm(f => ({ ...f, lastName: e.target.value }))}
                      className="w-full rounded-full border border-border px-5 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email <span className="text-destructive">*</span></label>
                    <input
                      required type="email"
                      value={contactForm.email}
                      onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full rounded-full border border-border px-5 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Phone <span className="text-destructive">*</span></label>
                    <input
                      required type="tel"
                      value={contactForm.phone}
                      onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full rounded-full border border-border px-5 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Message <span className="text-destructive">*</span></label>
                  <textarea
                    required rows={5}
                    placeholder="Write your message here or contact us by info@ideaground.net!"
                    value={contactForm.message}
                    onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full rounded-3xl border border-border px-5 py-4 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-foreground text-background rounded-full px-10 py-4 text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Resources Tab */}
      {activeTab === "resources" && (
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-center mb-8">
              IdeaGround Social Media Economics
            </h1>

            <p className="text-sm font-bold tracking-widest text-center text-muted-foreground mb-6">
              ABSTRACT
            </p>

            <p className="text-base leading-relaxed mb-6">
              Social media has innovated the world, yet it harbors inherent flaws such as
              inequality, misinformation, and privacy concerns. We introduce a novel economic
              incentives model called "ideaGround Social Media Economics (SME)" aimed at
              addressing the issue of inequality in social media. Our decentralized social media
              application, built upon the ideaGround-SME framework, serves to alleviate the
              shortcomings of existing social media platforms, positioning itself as the
              next-generation platform on Web 3.0.
            </p>

            <p className="text-primary font-medium mb-10">
              Keywords: Social Media, Financial Incentives, Blockchain, Web 3.0, Decentralization, Privacy
            </p>

            <div className="flex flex-col items-center gap-4">
              <a
                href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4900702"
                target="_blank"
                rel="noopener noreferrer"
                className="w-64 text-center bg-foreground text-background rounded-full px-8 py-4 text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Read Our White Paper
              </a>
              <a
                href="https://88b92f64-9b73-427f-9836-d3ea3e5bdf52.filesusr.com/ugd/733898_4131197b01064dc5b0e9523185cd9b41.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-64 text-center bg-foreground text-background rounded-full px-8 py-4 text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Read Our Pitch Deck
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Home Tab */}
      {activeTab === "home" && <>

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

      {/* Onboarding Demo Modal */}
      <OnboardingDemo
        open={showDemo}
        onOpenChange={setShowDemo}
        onGetStarted={login}
      />
      </>}

      {/* Footer — shared across all tabs */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="font-heading font-bold text-xl">ideaGround</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 ideaGround. Democratizing video ownership.
          </p>
        </div>
      </footer>
    </div>
  );
}
