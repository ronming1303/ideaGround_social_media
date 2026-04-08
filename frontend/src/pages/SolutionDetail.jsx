import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { ArrowLeft, Feather, Shield, AlertTriangle, Flame } from "lucide-react";
import { useForceLightTheme } from "../hooks/useForceLightTheme";

const solutionData = {
  inequality: {
    icon: Feather,
    title: "Inequality in Social Media",
    intro: (
      <>
        On most social media platforms, various forms of{" "}
        <span className="text-primary font-medium">inequality persist</span>, affecting
        different groups within the community.
      </>
    ),
    points: [
      "There is inequality between content creators and social media platforms.",
      "Inequality also exists between content creators and readers/supporters.",
      "There is inequality among co-writers.",
    ],
    quote: {
      text: "Creators who are part of the YouTube Partner Program (YPP) are eligible to earn money from ads displayed on their videos. The revenue generated from YPP ads is split between YouTube and the creator. YouTube typically keeps 45% of the revenue.",
      source: "YouTube",
    },
    body: [
      <>
        At ideaGround, we firmly believe in equality. Unlike many other platforms,{" "}
        <span className="text-primary font-medium">
          ideaGround does not take any commission from content creators
        </span>
        . Instead, we empower them to fully benefit from their contents.
      </>,
      <>
        Moreover, we recognize the invaluable role played by supporters in the success of
        content creators. Therefore,{" "}
        <span className="text-primary font-medium">
          ideaGround implements a revenue-sharing system called social media economics that
          ensures supporters are fairly rewarded for their contributions
        </span>
        .
      </>,
      <>
        In essence, ideaGround is committed to building a community where everyone—creators
        and supporters can thrive together, empowered by{" "}
        <span className="text-primary font-medium">
          a truly equitable social media ecosystem
        </span>
        .
      </>,
    ],
  },
  "intellectual-property": {
    icon: Shield,
    title: "Intellectual Property in Social Media",
    intro: (
      <>
        In this digital age,{" "}
        <span className="text-primary font-medium">
          user's words, ideas, and creations are their intellectual properties
        </span>
        . However, these valuable assets are increasingly under threat.
      </>
    ),
    points: [],
    extraIntro: [
      <>
        One significant concern is{" "}
        <span className="text-primary font-medium">intellectual property accessibility</span>
        . Social media platforms have the capability to tamper with or remove users' content,
        rendering it inaccessible to users.
      </>,
      <>
        Moreover, in the event of a platform crash, all users' valuable{" "}
        <span className="text-primary font-medium">intellectual properties could vanish</span>{" "}
        without a trace, leading a significant loss for entire communities.
      </>,
      <>
        Another pressing issue is{" "}
        <span className="text-primary font-medium">intellectual property infringement</span>
        . Unfortunately, many social media platforms do not prioritize the detection and
        punishment of such theft.
      </>,
    ],
    quote: {
      text: "OpenAI is lying when it says it is not using copyrighted data.",
      source: "Elon Musk",
    },
    body: [
      <>
        Data on the blockchain of ideaGround is resilient and resistant to tampering. Your{" "}
        <span className="text-primary font-medium">
          intellectual properties remain intact for data availability
        </span>
        .
      </>,
      <>
        The social media economics framework serves as the solution to address issues of
        intellectual property infringement. It provides{" "}
        <span className="text-primary font-medium">
          proof of your ownership of intellectual property
        </span>
        . No large language model can steal your intellectual property without your permission.
      </>,
      <>
        The social media economics also punish infringement for{" "}
        <span className="text-primary font-medium">protecting creators' interests</span>.
      </>,
    ],
  },
  censorship: {
    icon: AlertTriangle,
    title: "Censorship in Social Media",
    intro: (
      <>
        <span className="text-primary font-medium">
          Social media is heavily influenced by government and censorship
        </span>
        , especially in places where authoritarian regimes hold sway.
      </>
    ),
    points: [],
    extraIntro: [
      <>
        This means that what you see and hear online may be biased or even controlled by
        the government. Censorship limits people's access to different perspectives of
        information,{" "}
        <span className="text-primary font-medium">
          which leads misinformation and echo chamber
        </span>
        .
      </>,
    ],
    quote: {
      text: "Political writing in our time consists almost entirely of prefabricated phrases bolted together like the pieces of a child's Meccano set. It is the unavoidable result of self-censorship.",
      source: "George Orwell",
    },
    body: [
      <>
        The commerce conducted on ideaGround operates with utmost transparency and is{" "}
        <span className="text-primary font-medium">closely monitored by the community</span>.
      </>,
      <>
        When it comes to speaking your mind,{" "}
        <span className="text-primary font-medium">no government can interfere</span>{" "}
        in our community discussions.
      </>,
      <>
        We're dedicated to creating an open and fair platform where everyone feels{" "}
        <span className="text-primary font-medium">free to express themselves</span>. Our
        goal is to{" "}
        <span className="text-primary font-medium">break the echo chamber</span>{" "}
        by promoting diverse perspectives and ideas.
      </>,
    ],
  },
  "privacy": {
    icon: Flame,
    title: "Privacy in Social Media",
    intro: (
      <>
        One of the most significant issues with Web 2.0 social media is the erosion of user
        privacy.{" "}
        <span className="text-primary font-medium">
          Many platforms collect vast amounts of personal data, including browsing habits,
          and social connections
        </span>
        . It raises serious concerns about privacy and surveillance.
      </>
    ),
    points: [],
    extraIntro: [
      <>
        <span className="text-primary font-medium">
          Users have to trust that centralized social media platforms are honest and protect
          their privacy effectively
        </span>
        . What if they failed to be honest?
      </>,
    ],
    quotes: [
      {
        text: "Leaked internal Facebook documents show that the plans to sell access to user data were discussed for years and received support from Facebook's most senior executives, including CEO Mark Zuckerberg and chief operating officer Sheryl Sandberg.",
        source: "NBC News",
      },
      {
        text: "Social media has made us so eager to show and tell, but there is beauty in privacy. Everything isn't meant to be on display. It's perfectly fine to keep some things for you.",
        source: "Michael Bliss",
      },
    ],
    body: [
      <>
        IdeaGround operates on{" "}
        <span className="text-primary font-medium">blockchain</span>, ensuring privacy
        protection as a core principle.
      </>,
      <>
        Your data is only displayed publicly if you explicitly permit it.{" "}
        <span className="text-primary font-medium">
          Through the implementation of Zero-Knowledge Proof technology, any private data
          is protected by cryptography
        </span>
        .
      </>,
      <>
        <span className="text-primary font-medium">
          Neither ideaGround nor any unauthorized party can compromise your privacy
        </span>{" "}
        or access your confidential information.
      </>,
    ],
  },
};

export default function SolutionDetail() {
  useForceLightTheme();
  const { slug } = useParams();
  const { login } = useAuth();
  const solution = solutionData[slug];

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!solution) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-teal-50">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Solution not found.</p>
          <Link to="/" className="text-primary underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const Icon = solution.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50">
      {/* Nav */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="font-heading font-bold text-xl gradient-text">
                ideaGround
              </Link>
              <Link
                to="/?tab=solutions"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Solutions
              </Link>
            </div>
            <Button
              onClick={login}
              className="bg-primary text-white hover:bg-primary/90 rounded-full px-6"
            >
              Sign in with Google
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <Icon className="w-10 h-10 text-foreground/40 stroke-1" />
          </div>

          {/* Title */}
          <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-center mb-8">
            {solution.title}
          </h1>

          {/* Intro */}
          <p className="text-base leading-relaxed mb-6">{solution.intro}</p>

          {/* Extra intro paragraphs (optional) */}
          {solution.extraIntro?.length > 0 && (
            <div className="space-y-4 mb-8">
              {solution.extraIntro.map((para, i) => (
                <p key={i} className="text-base leading-relaxed">{para}</p>
              ))}
            </div>
          )}

          {/* Numbered list (optional) */}
          {solution.points?.length > 0 && (
            <ol className="list-decimal list-inside space-y-2 mb-8 text-base">
              {solution.points.map((point, i) => (
                <li key={i} className="leading-relaxed">{point}</li>
              ))}
            </ol>
          )}

          {/* Quote(s) */}
          {(solution.quotes ?? (solution.quote ? [solution.quote] : [])).map((q, i) => (
            <blockquote key={i} className="mb-8">
              <p className="text-base leading-relaxed mb-2">"{q.text}"</p>
              <footer className="text-right text-sm text-muted-foreground">— {q.source}</footer>
            </blockquote>
          ))}

          {/* Body paragraphs */}
          <div className="space-y-5">
            {solution.body.map((para, i) => (
              <p key={i} className="text-base leading-relaxed">{para}</p>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <Button
              onClick={login}
              className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-medium shadow-lg shadow-orange-500/20"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </main>

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
