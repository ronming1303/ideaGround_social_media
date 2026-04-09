import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import {
  Play, TrendingUp, ArrowRight, X,
  ShoppingCart, CheckCircle2
} from "lucide-react";

const STEPS = [
  { label: "Creator Lists" },
  { label: "You Discover" },
  { label: "You Invest" },
  { label: "It Goes Viral" },
  { label: "Everyone Earns" },
];

/* ── Step visuals ─────────────────────────────── */

function StepCreatorLists() {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">A creator uploads their best work</p>
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="relative">
          <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600" alt="Yoga" className="w-full h-36 object-cover" style={{ objectPosition: "center 35%" }} />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">LC</div>
            <div>
              <p className="font-semibold text-sm">@Lily Chen</p>
              <p className="text-xs text-muted-foreground">10-min Morning Yoga Flow</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="font-mono font-bold text-sm">$YOGA</p>
              <p className="text-xs text-muted-foreground">Ticker</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="font-mono font-bold text-sm">$1.00</p>
              <p className="text-xs text-muted-foreground">IPO Price</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="font-mono font-bold text-sm">1,000</p>
              <p className="text-xs text-muted-foreground">Shares</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-xs text-emerald-700 font-medium">Listed on ideaGround — open for investment</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepYouDiscover() {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">You browse the feed and spot potential</p>
      <div className="space-y-2.5">
        {[
          { ticker: "$YOGA", title: "10-min Morning Yoga Flow", creator: "@Lily Chen", price: "$1.25", change: "+25%", img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200", hot: true },
          { ticker: "$COOK", title: "One-Pan Pasta Hack", creator: "@Chef Marco", price: "$1.08", change: "+8%", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200" },
          { ticker: "$BEAT", title: "Lo-fi Beats to Study To", creator: "@SoundWave", price: "$1.02", change: "+2%", img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200" },
        ].map((v) => (
          <div key={v.ticker} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${v.hot ? "bg-primary/5 border-primary/30 shadow-sm" : "bg-card border-border/50"}`}>
            <div className="relative w-14 h-10 rounded-lg overflow-hidden shrink-0">
              <img src={v.img} alt={v.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <Play className="w-3 h-3 text-white fill-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-primary">{v.ticker}</span>
                {v.hot && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Trending</span>}
              </div>
              <p className="text-xs text-muted-foreground truncate">{v.title} · {v.creator}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono font-bold text-sm">{v.price}</p>
              <p className="text-xs text-emerald-500 font-medium">{v.change}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center italic">$YOGA is gaining traction — you decide to invest early.</p>
    </div>
  );
}

function StepYouInvest() {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">You buy shares at the current price</p>
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-end gap-2">
                <span className="font-heading font-bold text-2xl">$1.25</span>
                <span className="text-emerald-200 text-xs pb-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +25.0%
                </span>
              </div>
              <p className="text-white/70 text-xs mt-0.5">$YOGA · @Lily Chen</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">Max per person</p>
              <p className="font-bold text-sm">10 shares</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Available</span>
            <span className="font-mono font-semibold">230 / 1,000 shares</span>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shares</span>
              <span className="font-mono font-semibold">5</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price per share</span>
              <span className="font-mono">$1.25</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-border/50 pt-2">
              <span className="font-medium">Total</span>
              <span className="font-mono font-bold text-primary">$6.25</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-xs text-emerald-700 font-medium">Purchase confirmed — you own 5 shares of $YOGA</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepGoesViral() {
  const bars = [12, 18, 15, 22, 28, 35, 32, 45, 55, 68, 78, 92, 88, 100];
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">The video gains traction — your shares rise</p>
      <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-primary">$YOGA</span>
            <span className="text-xs text-muted-foreground">14-day chart</span>
          </div>
          <div className="text-right">
            <p className="font-heading font-bold text-xl text-emerald-600">$2.42</p>
            <p className="text-xs text-emerald-500 font-medium">+142% from IPO</p>
          </div>
        </div>
        <div className="flex items-end gap-1 h-24">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-primary to-primary/60 transition-all" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Day 1</span>
          <span>Day 14</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/50 rounded-lg p-2.5">
            <p className="font-mono font-bold text-sm">890K</p>
            <p className="text-xs text-muted-foreground">Views</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2.5">
            <p className="font-mono font-bold text-sm text-emerald-600">+142%</p>
            <p className="text-xs text-muted-foreground">Price Change</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2.5">
            <p className="font-mono font-bold text-sm">770</p>
            <p className="text-xs text-muted-foreground">Shareholders</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center italic">More views = more demand = higher share price. Your $6.25 is now worth $12.10.</p>
    </div>
  );
}

function StepEveryoneEarns() {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Revenue flows to every shareholder</p>
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-orange-500 to-orange-400">
          <div className="relative shrink-0">
            <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=200" alt="Yoga" className="w-14 h-10 rounded-lg object-cover" style={{ objectPosition: "center 20%" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-3 h-3 text-white fill-white drop-shadow" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-white text-sm">$YOGA · @Lily Chen</p>
            <p className="text-xs text-white/70">890K views</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-white/70">Today</p>
            <p className="font-heading font-bold text-lg text-white">$245</p>
          </div>
        </div>
        <div className="px-3 pt-2.5 pb-1.5">
          <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
            <div className="bg-orange-400 rounded-l-full" style={{ width: "75%" }} />
            <div className="bg-blue-400 rounded-r-full" style={{ width: "25%" }} />
          </div>
          <div className="flex items-center gap-5 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Creator 75%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Investors 25%</span>
          </div>
        </div>
        <div className="px-3 pb-3 pt-1">
          <div className="space-y-1">
            {[
              { name: "@Lily Chen", label: "Creator", pct: 75, payout: 183.75, type: "creator" },
              { name: "Alex W.", label: "5 shares", pct: 8, payout: 20.42, type: "investor" },
              { name: "You", label: "5 shares", pct: 8, payout: 20.42, type: "you" },
              { name: "Jordan L.", label: "3 shares", pct: 5, payout: 12.25, type: "investor" },
            ].map((row, i) => (
              <div key={i} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${row.type === "you" ? "bg-primary/10 border border-primary/30" : ""}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  row.type === "creator" ? "bg-orange-100 text-orange-600" : row.type === "you" ? "bg-primary text-white" : "bg-blue-100 text-blue-600"
                }`}>{row.type === "creator" ? "C" : row.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-medium ${row.type === "you" ? "text-primary" : ""}`}>{row.name}</span>
                  <span className="text-xs text-muted-foreground ml-1">{row.label}</span>
                </div>
                <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                  <div className={`h-full rounded-full ${row.type === "creator" ? "bg-orange-400" : row.type === "you" ? "bg-primary" : "bg-blue-400"}`} style={{ width: `${row.pct}%` }} />
                </div>
                <span className={`font-mono text-xs font-semibold w-14 text-right shrink-0 ${row.type === "you" ? "text-primary" : "text-emerald-600"}`}>+${row.payout.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center italic">Creators earn more. Viewers earn too. That's the idea.</p>
    </div>
  );
}

const VISUALS = [StepCreatorLists, StepYouDiscover, StepYouInvest, StepGoesViral, StepEveryoneEarns];

/* ── Main component ─────────────────────────────── */

export default function OnboardingDemo({ open, onOpenChange, onGetStarted }) {
  const [current, setCurrent] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!open || !auto) return;
    const t = setTimeout(() => {
      if (current < STEPS.length - 1) setCurrent((p) => p + 1);
      else setAuto(false);
    }, 5500);
    return () => clearTimeout(t);
  }, [current, open, auto]);

  useEffect(() => {
    if (open) { setCurrent(0); setAuto(true); }
  }, [open]);

  const go = (i) => { setAuto(false); setCurrent(i); };
  const Visual = VISUALS[current];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-background border-0 shadow-2xl rounded-2xl [&>button.right-4]:hidden">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-muted hover:bg-muted-foreground/15 flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5 text-foreground/70" />
        </button>

        {/* Step indicators — matching reference: two-line labels, numbered circles */}
        <div className="flex items-center justify-between pl-5 pr-12 pt-4 pb-1">
          {STEPS.map((step, i) => {
            const [line1, line2] = step.label.includes(" ")
              ? [step.label.substring(0, step.label.lastIndexOf(" ")), step.label.substring(step.label.lastIndexOf(" ") + 1)]
              : [step.label, ""];
            return (
              <button
                key={i}
                onClick={() => go(i)}
                className="flex flex-col items-center gap-1 transition-all group"
              >
                <span className={`text-xs font-semibold leading-tight text-center transition-colors ${
                  i === current ? "text-primary" : i < current ? "text-primary/60" : "text-muted-foreground/50"
                }`}>
                  {line1}
                </span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i === current
                    ? "bg-primary text-white scale-110 shadow-sm shadow-primary/30"
                    : i < current
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground/50"
                }`}>
                  {i < current ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                </div>
                {line2 && (
                  <span className={`text-xs font-semibold leading-tight text-center transition-colors ${
                    i === current ? "text-primary" : i < current ? "text-primary/60" : "text-muted-foreground/50"
                  }`}>
                    {line2}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Visual */}
        <div className="px-5 py-4 h-[420px]">
          <Visual />
        </div>

        {/* Navigation */}
        <div className="px-5 pb-5 flex gap-3">
          {current > 0 && (
            <Button variant="outline" onClick={() => go(current - 1)} className="rounded-xl border-border">
              Back
            </Button>
          )}
          {current < STEPS.length - 1 ? (
            <Button onClick={() => go(current + 1)} className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-xl py-5">
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => { onOpenChange(false); if (onGetStarted) onGetStarted(); }} className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-xl py-5">
              Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}