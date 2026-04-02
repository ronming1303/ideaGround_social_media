import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  ArrowLeft, Bell, Play, Eye, Heart, Users, Video, DollarSign, Megaphone
} from "lucide-react";

export default function CreatorProfile() {
  const { creatorId } = useParams();
  const { user } = useAuth();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [broadcasts, setBroadcasts] = useState([]);

  useEffect(() => {
    fetchCreator();
  }, [creatorId]);

  const fetchCreator = async () => {
    try {
      const [creatorRes, broadcastRes] = await Promise.all([
        axios.get(`${API}/creators/${creatorId}`, { withCredentials: true }),
        axios.get(`${API}/creators/${creatorId}/broadcasts`, { withCredentials: true }),
      ]);
      setCreator(creatorRes.data);
      setSubscribed(creatorRes.data.is_subscribed || false);
      setBroadcasts(broadcastRes.data);
    } catch (error) {
      console.error("Error fetching creator:", error);
      toast.error("Failed to load creator profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      const response = await axios.post(
        `${API}/creators/${creatorId}/subscribe`, 
        {}, 
        { withCredentials: true }
      );
      setSubscribed(response.data.subscribed);
      setCreator(c => ({ ...c, subscriber_count: response.data.subscriber_count }));
      toast.success(response.data.subscribed ? "Subscribed!" : "Unsubscribed");
      window.dispatchEvent(new CustomEvent('subscriptions-changed'));
    } catch (error) {
      toast.error("Failed to subscribe");
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  const filteredVideos = activeTab === "all" 
    ? creator?.videos 
    : creator?.videos?.filter(v => v.video_type === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading creator profile...</div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Creator not found</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Back button */}
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to feed
      </Link>

      {/* Creator header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 p-6 flex flex-col md:flex-row md:items-center gap-6">
        <img
          src={creator.image}
          alt={creator.name}
          className="w-24 h-24 rounded-2xl object-cover shadow-lg flex-shrink-0"
        />
        <div className="flex-1">
          <h1 className="font-heading text-3xl font-bold mb-1">{creator.name}</h1>
          {creator.bio && <p className="text-muted-foreground mb-3">{creator.bio}</p>}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">{formatNumber(creator.subscriber_count)}</span>
              <span className="text-muted-foreground">subscribers</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">{formatNumber(creator.total_views)}</span>
              <span className="text-muted-foreground">total views</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">{creator.videos?.length || 0}</span>
              <span className="text-muted-foreground">videos</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-emerald-600">${formatNumber(creator.total_revenue || 0)}</span>
              <Badge variant="outline" className="font-mono px-3">${creator.stock_symbol}</Badge>
            </div>
          </div>
        </div>
        <Button
          data-testid="creator-subscribe-btn"
          onClick={handleSubscribe}
          variant={subscribed ? "outline" : "default"}
          className={`rounded-full px-8 flex-shrink-0 ${!subscribed ? 'bg-primary text-white' : ''}`}
        >
          <Bell className={`w-4 h-4 mr-2 ${subscribed ? 'fill-current' : ''}`} />
          {subscribed ? 'Subscribed' : 'Subscribe'}
        </Button>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 mb-6">
          <TabsTrigger value="all" data-testid="creator-tab-all" className="rounded-full">
            All Videos ({creator.videos?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="broadcasts" className="rounded-full">
            <Megaphone className="w-3.5 h-3.5 mr-1.5" />
            Broadcasts ({broadcasts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="broadcasts" className="mt-0">
          {broadcasts.length > 0 ? (
            <div className="space-y-3 max-w-2xl">
              {broadcasts.map((b) => (
                <div key={b.broadcast_id} className="p-4 rounded-xl bg-card border border-border/50">
                  <p className="text-sm whitespace-pre-wrap">{b.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(b.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Megaphone className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No broadcasts yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-0">
          {filteredVideos?.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <Link
                  key={video.video_id}
                  to={`/video/${video.video_id}`}
                  data-testid={`creator-video-${video.video_id}`}
                  className="group overflow-hidden rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div className="w-14 h-14 rounded-full bg-black/70 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-sm line-clamp-2 leading-snug flex-1">
                        {video.title}
                      </h3>
                      <div className="flex-shrink-0 px-2 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600">
                        ${video.share_price.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {formatNumber(video.views)} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        {formatNumber(video.likes)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Video className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-heading font-semibold mb-2">No videos yet</h3>
              <p className="text-muted-foreground">This creator hasn't uploaded any videos in this category</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
