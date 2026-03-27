import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Slider } from "../components/ui/slider";
import { Badge } from "../components/ui/badge";
import {
  Heart, MessageSquare, ShoppingCart, X,
  PieChart, Volume2, VolumeX, Play, Pause
} from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import VideoComments from "../components/VideoComments";

// Shared panel content (used in both desktop sidebar and mobile sheets)
function CommentsPanel({ videoId, onClose }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <h3 className="font-semibold">Comments</h3>
        <button onClick={onClose} className="text-muted-foreground"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {videoId && <VideoComments videoId={videoId} />}
      </div>
    </div>
  );
}

function InvestmentPanel({ details, sharesToBuy, setSharesToBuy, onBuy, buying, walletBalance, onClose }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <h3 className="font-semibold">Investment Details</h3>
        <button onClick={onClose} className="text-muted-foreground"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!details ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground animate-pulse">Loading...</div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
              <p className="text-sm text-white/70 mb-1">${details.ticker_symbol}</p>
              <p className="font-heading text-3xl font-bold">${details.share_price.toFixed(2)}</p>
              <p className="text-sm text-white/70">per share</p>
            </div>

            {details.volumeHistory?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Trading Volume</p>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={details.volumeHistory} barSize={8}>
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload?.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-xs">
                                <p className="text-muted-foreground">{d.date}</p>
                                <p className="text-emerald-600">Buy: {d.buy}</p>
                                {d.sell > 0 && <p className="text-orange-500">Sell: {d.sell}</p>}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="buy" fill="hsl(173, 58%, 39%)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="sell" fill="hsl(24, 95%, 53%)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-xs text-muted-foreground">Available</p>
                <p className="font-mono font-bold">
                  {details.available_shares}
                  <span className="text-xs text-muted-foreground font-normal">/{details.total_shares}</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-xs text-muted-foreground">You Own</p>
                <p className="font-mono font-bold">{details.user_shares || 0} shares</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/50 space-y-2">
              <p className="text-xs font-medium flex items-center gap-1"><PieChart className="w-3 h-3" /> Revenue Split</p>
              <div className="flex h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary" style={{ width: "80%" }} />
                <div className="bg-emerald-500" style={{ width: "10%" }} />
                <div className="bg-muted-foreground" style={{ width: "10%" }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Creator 80%</span><span>Holders 10%</span><span>Platform 10%</span>
              </div>
            </div>

            {(() => {
              const maxPerUser = Math.floor((details.total_shares || 1000) * 0.1);
              const canBuyMore = Math.max(0, maxPerUser - (details.user_shares || 0));
              const sliderMax = Math.min(details.available_shares || 0, canBuyMore);
              const effectiveShares = Math.min(sharesToBuy, sliderMax);

              if (canBuyMore <= 0) {
                return (
                  <div className="p-4 rounded-xl bg-muted/50 text-center text-sm text-muted-foreground">
                    You've reached the ownership limit for this video ({Math.round(maxPerUser / (details.total_shares || 1000) * 100)}% max).
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Shares to buy</p>
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[effectiveShares]}
                      onValueChange={v => setSharesToBuy(v[0])}
                      max={sliderMax}
                      min={1} step={1} className="flex-1"
                    />
                    <Input
                      type="number" value={effectiveShares}
                      onChange={e => setSharesToBuy(Math.min(Math.max(1, Number(e.target.value)), sliderMax))}
                      className="w-16 text-center font-mono"
                    />
                  </div>
                  <div className="flex justify-between text-sm p-3 bg-muted/50 rounded-xl">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">${(details.share_price * effectiveShares).toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={onBuy}
                    disabled={buying || sliderMax <= 0 || (walletBalance < details.share_price * effectiveShares)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl py-6 text-base font-bold shadow-lg shadow-orange-500/25"
                  >
                    {buying ? "Processing..." : sliderMax <= 0 ? "SOLD OUT" : `Buy ${effectiveShares} Share${effectiveShares > 1 ? "s" : ""}`}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">Balance: ${walletBalance?.toFixed(2) || "0.00"}</p>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

export default function Shorts() {
  const { videoId: initialVideoId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoId, setCurrentVideoId] = useState(initialVideoId);
  const [videoDetails, setVideoDetails] = useState({});
  const [fetchingDetails, setFetchingDetails] = useState({});
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [buySheetOpen, setBuySheetOpen] = useState(false);
  const [likedVideos, setLikedVideos] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [buying, setBuying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [showIcon, setShowIcon] = useState(null); // videoId of the video showing icon
  const iconTimerRef = useRef(null);

  const itemRefs = useRef({});
  const videoRefs = useRef({});
  const iframeRefs = useRef({});
  const didScrollRef = useRef(false);

  const panelOpen = commentSheetOpen || buySheetOpen;

  useEffect(() => {
    axios.get(`${API}/videos?video_type=short&limit=50`, { withCredentials: true })
      .then(r => setShorts(Array.isArray(r.data) ? r.data : []))
      .catch(() => toast.error("Failed to load shorts"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!didScrollRef.current && shorts.length > 0 && initialVideoId) {
      const el = itemRefs.current[initialVideoId];
      if (el) { el.scrollIntoView({ behavior: "instant" }); didScrollRef.current = true; }
    }
  }, [shorts, initialVideoId]);

  const fetchVideoDetails = useCallback(async (videoId) => {
    if (videoDetails[videoId] || fetchingDetails[videoId]) return;
    setFetchingDetails(prev => ({ ...prev, [videoId]: true }));
    try {
      const [vr, vol] = await Promise.all([
        axios.get(`${API}/videos/${videoId}`, { withCredentials: true }),
        axios.get(`${API}/videos/${videoId}/volume`, { withCredentials: true }).catch(() => ({ data: { volume_history: [] } })),
      ]);
      setVideoDetails(prev => ({ ...prev, [videoId]: { ...vr.data, volumeHistory: vol.data.volume_history || [] } }));
      setLikedVideos(prev => ({ ...prev, [videoId]: vr.data.user_liked || false }));
      setLikeCounts(prev => ({ ...prev, [videoId]: vr.data.likes || 0 }));
    } catch { /* silent */ }
    finally { setFetchingDetails(prev => ({ ...prev, [videoId]: false })); }
  }, [videoDetails, fetchingDetails]);

  useEffect(() => {
    if (shorts.length === 0) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio >= 0.5) setCurrentVideoId(e.target.dataset.videoId);
      }),
      { threshold: 0.5 }
    );
    Object.values(itemRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [shorts]);

  useEffect(() => { if (currentVideoId) fetchVideoDetails(currentVideoId); }, [currentVideoId]);
  useEffect(() => {
    // Sync muted state to <video> elements
    Object.values(videoRefs.current).forEach(el => { if (el) el.muted = muted; });
    // Sync muted state to YouTube iframes via postMessage
    const cmd = muted ? "mute" : "unMute";
    Object.values(iframeRefs.current).forEach(el => {
      if (el) el.contentWindow?.postMessage(JSON.stringify({ event: "command", func: cmd, args: [] }), "*");
    });
  }, [muted]);

  const handleLike = async (videoId) => {
    try {
      const r = await axios.post(`${API}/videos/${videoId}/like`, {}, { withCredentials: true });
      setLikedVideos(prev => ({ ...prev, [videoId]: r.data.liked }));
      setLikeCounts(prev => ({ ...prev, [videoId]: r.data.likes }));
    } catch { toast.error("Failed to like video"); }
  };

  const handleBuyShares = async () => {
    const details = videoDetails[currentVideoId];
    if (!details) return;
    setBuying(true);
    try {
      const r = await axios.post(`${API}/shares/buy`, { video_id: currentVideoId, shares: sharesToBuy }, { withCredentials: true });
      toast.success(`Bought ${sharesToBuy} shares for $${r.data.total_cost.toFixed(2)}`);
      setSharesToBuy(1); // Reset slider but keep panel open
      if (user) setUser({ ...user, wallet_balance: r.data.new_wallet_balance });
      // Refresh data without clearing (to avoid Loading flash)
      const [vr, vol] = await Promise.all([
        axios.get(`${API}/videos/${currentVideoId}`, { withCredentials: true }),
        axios.get(`${API}/videos/${currentVideoId}/volume`, { withCredentials: true }).catch(() => ({ data: { volume_history: [] } })),
      ]);
      setVideoDetails(prev => ({ ...prev, [currentVideoId]: { ...vr.data, volumeHistory: vol.data.volume_history || [] } }));
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to buy shares");
    } finally { setBuying(false); }
  };

  const closePanel = () => { setCommentSheetOpen(false); setBuySheetOpen(false); };

  const fmt = (n) => {
    if (!n) return "0";
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse text-white">Loading shorts...</div>
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-center">
        <div>
          <p className="mb-4">No shorts yet</p>
          <Button onClick={() => navigate("/dashboard")} variant="outline" className="text-white border-white">Back to feed</Button>
        </div>
      </div>
    );
  }

  const currentDetails = videoDetails[currentVideoId];

  return (
    <div className="flex bg-black h-screen overflow-hidden">

      {/* ── Video area ── */}
      <div className="relative flex-1 overflow-hidden">

        {/* Mute toggle */}
        <button
          onClick={() => setMuted(m => !m)}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* Scroll container */}
        <div className="h-full overflow-y-scroll snap-y snap-mandatory" style={{ scrollbarWidth: "none" }}>
          {shorts.map((short) => {
            const isActive = short.video_id === currentVideoId;
            const liked = likedVideos[short.video_id] ?? short.user_liked ?? false;
            const likeCount = likeCounts[short.video_id] ?? short.likes ?? 0;
            const price = videoDetails[short.video_id]?.share_price ?? short.share_price;

            return (
              <div
                key={short.video_id}
                ref={el => { itemRefs.current[short.video_id] = el; }}
                data-video-id={short.video_id}
                className="h-screen snap-start snap-always flex items-center justify-center bg-black"
              >
                {/* 9:16 container */}
                <div className="relative h-full aspect-[9/16] max-w-full">
                  {short.video_file_path ? (
                    <video
                      src={`${API}/videos/${short.video_id}/stream`}
                      className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                      loop playsInline autoPlay={isActive} muted poster={short.thumbnail}
                      onClick={() => {
                        const el = videoRefs.current[short.video_id];
                        if (!el) return;
                        if (el.paused) { el.play().catch(() => {}); setPaused(false); }
                        else { el.pause(); setPaused(true); }
                        // Show TikTok-style icon briefly
                        setShowIcon(short.video_id);
                        clearTimeout(iconTimerRef.current);
                        iconTimerRef.current = setTimeout(() => setShowIcon(null), 600);
                      }}
                      ref={el => {
                        if (el) {
                          videoRefs.current[short.video_id] = el;
                          el.muted = muted;
                          if (isActive && !paused) el.play().catch(() => {});
                          else if (!isActive) { el.pause(); el.currentTime = 0; }
                        }
                      }}
                    />
                  ) : (
                    <iframe
                      ref={el => { iframeRefs.current[short.video_id] = el; }}
                      src={`${short.video_url}?autoplay=${isActive ? 1 : 0}&mute=1&enablejsapi=1&loop=1&controls=0`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                      allowFullScreen
                      onLoad={() => {
                        const el = iframeRefs.current[short.video_id];
                        if (el && !muted) {
                          // Small delay to let the player initialize before sending command
                          setTimeout(() => {
                            el.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "unMute", args: [] }), "*");
                          }, 500);
                        }
                      }}
                    />
                  )}

                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                  {/* TikTok-style pause/play icon */}
                  {showIcon === short.video_id && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center animate-ping-once">
                        {paused ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
                      </div>
                    </div>
                  )}

                  {/* Right-side action buttons */}
                  <div className="absolute right-4 bottom-36 flex flex-col gap-5 items-center z-20">
                    <button onClick={() => handleLike(short.video_id)} className="flex flex-col items-center gap-1">
                      <div className={`w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-transform active:scale-90 ${liked ? "text-red-500" : "text-white"}`}>
                        <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
                      </div>
                      <span className="text-white text-xs font-medium drop-shadow">{fmt(likeCount)}</span>
                    </button>

                    <button
                      onClick={() => { setCommentSheetOpen(true); setBuySheetOpen(false); fetchVideoDetails(short.video_id); }}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center text-white transition-colors ${commentSheetOpen ? "bg-white/20 ring-2 ring-white/50" : "bg-black/30"}`}>
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <span className="text-white text-xs font-medium drop-shadow">Comments</span>
                    </button>

                    <button
                      onClick={() => { setBuySheetOpen(true); setCommentSheetOpen(false); fetchVideoDetails(short.video_id); setSharesToBuy(1); }}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-colors ${buySheetOpen ? "bg-orange-600 ring-2 ring-orange-300/50" : "bg-orange-500 shadow-orange-500/40"}`}>
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                      <span className="text-white text-xs font-medium drop-shadow">
                        {price != null ? `$${Number(price).toFixed(2)}` : "—"}
                      </span>
                    </button>

                    {short.creator && (
                      <Link to={`/creator/${short.creator.creator_id}`}>
                        <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                          <img src={short.creator.image} alt={short.creator.name} className="w-full h-full object-cover" />
                        </div>
                      </Link>
                    )}
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-6 left-4 right-20 z-20">
                    <Badge className="mb-2 bg-orange-500/90 text-white border-0 font-mono text-xs">
                      ${short.ticker_symbol || short.creator?.stock_symbol || "VID"}
                    </Badge>
                    <h3 className="text-white font-bold text-base line-clamp-2 mb-1 drop-shadow-lg">{short.title}</h3>
                    {short.creator && <p className="text-white/80 text-sm drop-shadow">@{short.creator.name}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile backdrop */}
        {panelOpen && (
          <div className="lg:hidden absolute inset-0 bg-black/50 z-30" onClick={closePanel} />
        )}

        {/* Mobile — Comments bottom sheet */}
        <div
          className={`lg:hidden absolute inset-x-0 bottom-0 z-40 bg-card rounded-t-3xl transition-transform duration-300 ease-out ${commentSheetOpen ? "translate-y-0" : "translate-y-full"}`}
          style={{ height: "70vh" }}
        >
          <CommentsPanel videoId={currentVideoId} onClose={closePanel} />
        </div>

        {/* Mobile — Buy bottom sheet */}
        <div
          className={`lg:hidden absolute inset-x-0 bottom-0 z-40 bg-card rounded-t-3xl transition-transform duration-300 ease-out ${buySheetOpen ? "translate-y-0" : "translate-y-full"}`}
          style={{ height: "82vh" }}
        >
          <InvestmentPanel
            details={currentDetails}
            sharesToBuy={sharesToBuy}
            setSharesToBuy={setSharesToBuy}
            onBuy={handleBuyShares}
            buying={buying}
            walletBalance={user?.wallet_balance}
            onClose={closePanel}
          />
        </div>
      </div>

      {/* ── Desktop right panel — slides in as flex sibling ── */}
      <div
        className={`hidden lg:flex flex-col bg-card border-l border-border flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-out`}
        style={{ width: panelOpen ? "380px" : "0px" }}
      >
        {/* inner div keeps content from squishing during animation */}
        <div className="w-[380px] h-full flex flex-col">
          {commentSheetOpen && <CommentsPanel videoId={currentVideoId} onClose={closePanel} />}
          {buySheetOpen && (
            <InvestmentPanel
              details={currentDetails}
              sharesToBuy={sharesToBuy}
              setSharesToBuy={setSharesToBuy}
              onBuy={handleBuyShares}
              buying={buying}
              walletBalance={user?.wallet_balance}
              onClose={closePanel}
            />
          )}
        </div>
      </div>

    </div>
  );
}
