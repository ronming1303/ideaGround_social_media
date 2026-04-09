import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Play, TrendingUp, Users, DollarSign, ArrowRight, Sparkles, Menu, X, CheckCircle2, Mail, Layers, PieChart } from "lucide-react";
import OnboardingDemo from "../components/OnboardingDemo";
import { useForceLightTheme } from "../hooks/useForceLightTheme";

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
  useForceLightTheme();
  const { login } = useAuth();
  const [showDemo, setShowDemo] = useState(false);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "" });
  // Interactive hero card state
  const [heroCardStep, setHeroCardStep] = useState("buy");
  const [cursorPos, setCursorPos] = useState({ x: 180, y: 80 });
  const [cursorClicking, setCursorClicking] = useState(false);
  const [cursorOnYou, setCursorOnYou] = useState(false);

  // Auto-play animation loop
  const runAnimation = useCallback(() => {
    // Reset to buy
    setHeroCardStep("buy");
    setCursorPos({ x: 180, y: 80 });
    setCursorClicking(false);
    setCursorOnYou(false);

    const timers = [];

    // Move cursor to Buy button
    timers.push(setTimeout(() => setCursorPos({ x: 170, y: 420 }), 1200));
    // Click
    timers.push(setTimeout(() => setCursorClicking(true), 2400));
    timers.push(setTimeout(() => {
      setCursorClicking(false);
      setHeroCardStep("celebrate");
    }, 2700));
    // Move cursor away during celebrate
    timers.push(setTimeout(() => setCursorPos({ x: 200, y: 200 }), 3000));
    // Transition to earn
    timers.push(setTimeout(() => setHeroCardStep("earn"), 6200));
    // Move cursor to "You" row
    timers.push(setTimeout(() => setCursorPos({ x: 260, y: 300 }), 7000));
    timers.push(setTimeout(() => setCursorOnYou(true), 8000));
    timers.push(setTimeout(() => setCursorOnYou(false), 9500));

    return timers;
  }, []);

  useEffect(() => {
    let timers = runAnimation();
    const interval = setInterval(() => {
      timers.forEach(clearTimeout);
      timers = runAnimation();
    }, 11000);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [runAnimation]);

  const handleContact = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact from ${contactForm.firstName} ${contactForm.lastName}`);
    const body = encodeURIComponent(
`Name: ${contactForm.firstName} ${contactForm.lastName}
Email: ${contactForm.email}
Phone: ${contactForm.phone || 'Not provided'}

Message:
${contactForm.message}`
    );
    window.location.href = `mailto:info@ideaground.net,contact@ideaground.net?subject=${subject}&body=${body}`;
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

  const navTabs = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "solutions", label: "Solutions" },
    { id: "resources", label: "Resources" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 overflow-x-hidden">
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
                {navTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                      activeTab === tab.id
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
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
            {navTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                }`}
              >
                {tab.label}
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
                Social media makes significant changes to our life, but it brings problems that have become increasingly evident in recent years.
              </p>
              <p>
                The solution is designing a novel mechanism to achieve desirable social and economic outcomes given the constraints of users' self-interest.
              </p>
              <p>
                The solution is ideaGround Social Media Economics. It applies principles from economic game theory, computer science, management, and finance.
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
        <section className="pt-32 pb-20 px-4">

          {/* Hero */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-8 leading-tight">
              Building social media that's fair,<br className="hidden md:block" /> transparent, and yours.
            </h1>
            <div className="space-y-4 text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto text-left">
              <p>We are a next-generation video-sharing platform that transforms social media content into tradable assets.
              Powered by our proprietary Social Media Economics protocol, we address the core flaws of social media—unfair revenue distribution, lack of IP ownership, and opaque pricing.</p>
              <p>Our platform enables creators and users to earn through content creation, sharing, and engagement.
              Content is securitized and transparently priced, allowing for fractional ownership and future dividends.
              We offer low-risk social media content investment opportunities alongside gamified user experiences to drive engagement.</p>
              <p>IdeaGround is not just a platform — it's a movement to take back the internet.</p>
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
                  <h2 className="font-heading text-3xl font-bold mb-4">{item.label}</h2>
                  <p className="text-base text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SME Cards */}
          <div className="px-4 py-16 max-w-4xl mx-auto">
            <p className="text-sm font-bold tracking-widest text-muted-foreground text-center mb-10">WHAT WE DELIVER</p>
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

        </section>
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
                  <label className="text-sm font-medium mb-1.5 block">Phone</label>
                  <input
                    type="tel"
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
                  placeholder="Write your message here..."
                  value={contactForm.message}
                  onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full rounded-3xl border border-border px-5 py-4 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="bg-foreground text-background rounded-full px-10 py-4 text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Open Email
                </button>
                <span className="text-sm text-muted-foreground">
                  or email us at <a href="mailto:info@ideaground.net,contact@ideaground.net" className="text-primary hover:underline">info@ideaground.net</a>
                </span>
              </div>
            </form>
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

            <p className="text-muted-foreground text-sm mb-10">
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
      <section className="pt-24 sm:pt-28 pb-6 sm:pb-20 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left: Text */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full text-sm font-medium text-accent-foreground">
              <Sparkles className="w-4 h-4" />
              The future of content ownership
            </div>

            <h1 className="mt-5 sm:mt-6 font-heading text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Watch. Invest.
              <span className="block">
                <span className="text-primary">Own</span>{" "}
                <span className="gradient-text">the Future.</span>
              </span>
            </h1>

            <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
              ideaGround combines the best of video sharing and content creation with stock-trading mechanics.
              Buy shares of trending videos and grow your portfolio as creators succeed.
            </p>

            <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl font-semibold tracking-tight max-w-lg mx-auto lg:mx-0">
              Creators earn more. Viewers earn too.{" "}
              <span className="gradient-text">That's the idea.</span>
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 mt-7 sm:mt-8">
              <Button
                data-testid="get-started-btn"
                onClick={login}
                className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-5 sm:py-6 text-base sm:text-lg font-medium shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                data-testid="watch-demo-btn"
                variant="outline"
                onClick={() => setShowDemo(true)}
                className="rounded-full px-8 py-5 sm:py-6 text-base sm:text-lg font-medium border-2 hover:bg-orange-50 hover:border-orange-300 transition-colors"
              >
                <Play className="w-5 h-5 mr-2 text-orange-500" />
                Watch Demo
              </Button>
            </div>

            {/* Old way → New way contrast */}
            <div className="flex items-center gap-3 mt-5 justify-center lg:justify-start">
              <span className="text-sm line-through text-muted-foreground/40 font-medium">Like. Subscribe. Share.</span>
              <ArrowRight className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">Invest. Own. Earn.</span>
            </div>
          </div>

          {/* Right: Interactive Animated Card */}
          <div className="relative w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto pointer-events-none mt-4 lg:mt-0" data-testid="demo-steps-card">
            <div className="relative bg-card rounded-3xl shadow-2xl shadow-black/10 border border-border/50 overflow-hidden min-h-[420px]">

              {/* Animated Cursor */}
              <div
                className="absolute z-50 pointer-events-none"
                style={{ left: cursorPos.x, top: cursorPos.y, transition: "left 1100ms ease-in-out, top 1100ms ease-in-out" }}
              >
                <div className={`relative w-4 h-5 transition-transform duration-150 ${cursorClicking ? "scale-75" : "scale-100"}`}>
                  <svg viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L1 14L4.5 10.5L6.5 16L8.5 15L6.5 9.5L11 9.5L1 1Z" fill="white" stroke="#1a1a1a" strokeWidth="1.2" strokeLinejoin="round"/>
                  </svg>
                  {cursorClicking && (
                    <span className="absolute -inset-2 rounded-full bg-primary/30 animate-ping" />
                  )}
                </div>
              </div>

              {/* Buy State */}
              <div className={`transition-all duration-500 ease-in-out ${heroCardStep === "buy" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 absolute inset-x-0 top-0 pointer-events-none"}`}>
                <div>
                  <div className="relative">
                    <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600" alt="10-min Morning Yoga Flow" className="w-full h-36 object-cover" style={{ objectPosition: "center 35%" }} />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-3">
                      <span className="font-mono font-bold text-white text-sm bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md">$YOGA</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-4 text-white">
                    <div className="flex items-end gap-3">
                      <span className="font-heading font-bold text-4xl">$1.25</span>
                      <span className="text-emerald-200 text-sm pb-1 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" /> +25.0% today
                      </span>
                    </div>
                    <p className="text-white/70 text-xs mt-1">10-min Morning Yoga Flow · @Lily Chen</p>
                  </div>
                  <div className="px-6 pt-4 pb-2">
                    <div className="flex items-end gap-1 h-12">
                      {[30, 45, 35, 60, 50, 75, 55, 80, 70, 90, 85, 100].map((h, i) => (
                        <div key={i} className={`flex-1 rounded-sm ${i >= 9 ? "bg-primary" : "bg-muted"}`} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="px-6 pb-4">
                    <div className="bg-muted/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground">Available Shares</p>
                      <p className="font-mono font-semibold">230 / 1,000</p>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <button className="w-full bg-primary text-white rounded-2xl py-4 font-semibold text-sm flex items-center justify-center gap-2">
                      Buy 5 Shares — $6.25
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Celebrate State */}
              <div className={`transition-all duration-500 ease-in-out ${heroCardStep === "celebrate" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 absolute inset-x-0 top-0 pointer-events-none"}`}>
                <div className="flex flex-col items-center justify-center text-center px-8 py-10 space-y-5 min-h-[430px]">
                  <div className="text-6xl leading-none">&#x1F389;</div>
                  <div>
                    <p className="font-heading font-bold text-xl mt-3">Purchase Confirmed!</p>
                    <p className="text-muted-foreground text-sm mt-1">You now own <span className="font-semibold text-foreground">5 shares</span> of <span className="font-mono font-bold text-primary">$YOGA</span></p>
                  </div>
                  <div className="w-full bg-muted/50 rounded-2xl p-4 flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">Invested</p>
                      <p className="font-mono font-bold text-lg">$6.25</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Shares</p>
                      <p className="font-mono font-bold text-lg text-primary">5 / 1,000</p>
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-center gap-2">
                    {[["Views", "&#x1F441;"], ["Revenue", "&#x1F4B0;"], ["Your share", "&#x1F4C8;"]].map(([label, icon], i, arr) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className="flex flex-col items-center gap-1 bg-muted/50 rounded-xl px-4 py-3">
                          <span className="text-xl" dangerouslySetInnerHTML={{ __html: icon }} />
                          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{label}</span>
                        </div>
                        {i < arr.length - 1 && <span className="text-muted-foreground/40 font-light text-lg">&rarr;</span>}
                      </div>
                    ))}
                  </div>
                  <div className="w-full space-y-2">
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all ease-linear"
                        style={{
                          width: heroCardStep === "celebrate" ? "100%" : "0%",
                          transitionDuration: heroCardStep === "celebrate" ? "3000ms" : "0ms",
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Loading today's earnings...</p>
                  </div>
                </div>
              </div>

              {/* Earn State */}
              <div className={`transition-all duration-500 ease-in-out ${heroCardStep === "earn" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 absolute inset-x-0 top-0 pointer-events-none"}`}>
                <div>
                  <div className="flex items-center gap-4 p-5 border-b border-border/50 bg-gradient-to-r from-orange-500 to-orange-400">
                    <div className="relative shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200"
                        alt="10-min Morning Yoga Flow"
                        className="w-20 h-14 rounded-xl object-cover"
                        style={{ objectPosition: "center 20%" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white drop-shadow" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-white text-sm">10-min Morning Yoga Flow</p>
                      <p className="text-xs text-white/70 whitespace-nowrap">@Lily Chen · 890K views</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-white/70">Today's Revenue</p>
                      <p className="font-heading font-bold text-xl text-white">$245.00</p>
                    </div>
                  </div>
                  <div className="px-5 pt-4 pb-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">DISTRIBUTION</p>
                    <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                      <div className="bg-orange-400" style={{ width: "75%" }} />
                      <div className="bg-blue-400" style={{ width: "25%" }} />
                    </div>
                    <div className="flex items-center gap-6 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Creator 75%</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Investors 25%</span>
                    </div>
                  </div>
                  <div className="px-5 pb-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">PAYOUTS TODAY</p>
                    <div className="space-y-1">
                      {[
                        { name: "@Lily Chen", label: "Creator",  pct: 75, payout: 183.75, isCreator: true },
                        { name: "Alex W.",    label: "5 shares", pct: 8,  payout: 20.42 },
                        { name: "You",        label: "5 shares", pct: 8,  payout: 20.42, isYou: true },
                        { name: "Jordan L.",  label: "3 shares", pct: 5,  payout: 12.25 },
                      ].map((row, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${row.isYou ? (cursorOnYou ? "bg-primary/15 border border-primary/50 shadow-sm shadow-primary/20" : "bg-primary/5 border border-primary/20") : "hover:bg-muted/40"}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${row.isCreator ? "bg-orange-100 text-orange-600" : row.isYou ? "bg-primary text-white" : "bg-blue-100 text-blue-600"}`}>
                            {row.isCreator ? "C" : row.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs font-medium ${row.isYou ? "text-primary" : ""}`}>{row.name}</span>
                            <span className="text-xs text-muted-foreground ml-1.5">{row.label}</span>
                          </div>
                          <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                            <div className={`h-full rounded-full ${row.isCreator ? "bg-orange-400" : row.isYou ? "bg-primary" : "bg-blue-400"}`} style={{ width: `${row.pct}%` }} />
                          </div>
                          <span className={`font-mono text-xs font-semibold w-12 text-right shrink-0 ${row.isYou ? "text-primary" : "text-emerald-600"}`}>+${row.payout.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-muted/30 border-t border-border/50 text-center">
                    <p className="text-xs text-muted-foreground">Powered by Social Media Economics protocol</p>
                  </div>
                </div>
              </div>

            </div>
            <div className="absolute -z-10 top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -z-10 bottom-10 -left-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />
          </div>

        </div>
      </section>

      {/* Manifesto */}
      <section className="py-10 sm:py-16 px-4" id="securitize">
        <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
          <p className="font-heading text-xl sm:text-2xl md:text-4xl font-bold tracking-tight leading-snug">
            Where creators become <span className="text-primary">entrepreneurs</span> and viewers become <span className="text-secondary">investors</span>.
          </p>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            From passive viewing to active ownership. Creators don't just post — they launch. Viewers don't just watch — they invest.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4">
              How it works
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              A revolutionary platform where entertainment meets investment
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 sm:p-8 hover:shadow-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="font-heading font-semibold text-base sm:text-xl mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-base text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Economics — 3 pillars */}
      <section className="py-12 sm:py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-14">
            <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">Social Media Economics</p>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Your content. <span className="text-primary">Your shares.</span> Your earnings.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Securitize */}
            <div>
              <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-2">Your content is your asset</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Securitize your content and turn it into equity. Sell a portion of shares to raise funding from your audience — before a single ad dollar is earned.
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-slate-300">Content is securitized the moment you publish</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-slate-300">Sold shares become direct funding from investors</span>
                </div>
              </div>
            </div>

            {/* Trade */}
            <div>
              <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-2">Invest in creators like stocks</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Buy and sell content shares on an open market. Back the creators you believe in — and become a partner in their growth.
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-slate-300">Trade shares just like stocks — buy, hold, or sell</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-slate-300">Discover undervalued content before it breaks out</span>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div>
              <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <PieChart className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-2">Everyone wins when content succeeds</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Creators and shareholders split revenue together — fairly, transparently, and automatically. When content grows, the whole community grows with it.
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-slate-300">Revenue is proportional to your ownership</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-slate-300">The more content earns, the more every shareholder earns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 sm:p-12 text-center text-white">
            <div className="relative z-10">
              <h2 className="font-heading text-2xl sm:text-3xl md:text-5xl font-bold mb-3 sm:mb-4">
                Ready to own the future?
              </h2>
              <p className="text-sm sm:text-lg text-white/80 mb-6 sm:mb-8 max-w-xl mx-auto">
                Sign up and start investing in the content you believe in
              </p>
              <Button
                data-testid="cta-get-started-btn"
                onClick={login}
                className="bg-white text-primary hover:bg-white/90 rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-medium"
              >
                Get Started Free
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
            © 2026 ideaGround. Democratizing content ownership.
          </p>
        </div>
      </footer>
    </div>
  );
}
