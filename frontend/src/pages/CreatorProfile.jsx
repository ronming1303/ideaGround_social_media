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
  ArrowLeft, Bell, Play, Eye, Heart, Clock, TrendingUp, Users, Video
} from "lucide-react";

export default function CreatorProfile() {
  const { creatorId } = useParams();
  const { user } = useAuth();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchCreator();
  }, [creatorId]);

  const fetchCreator = async () => {
    try {
      const response = await axios.get(`${API}/creators/${creatorId}`, { withCredentials: true });
      setCreator(response.data);
      setSubscribed(response.data.is_subscribed || false);
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
      toast.success(response.data.subscribed ? "Subscribed!" : "Unsubscribed");
      // Update subscriber count locally
      if (creator) {
        setCreator({
          ...creator,
          subscriber_count: creator.subscriber_count + (response.data.subscribed ? 1 : -1)
        });
      }
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
      <div className="relative mb-8">
        {/* Banner */}
        <div className="h-48 rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/10 to-primary/20 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200')] bg-cover bg-center opacity-30"></div>
        </div>

        {/* Profile info */}
        <div className="relative px-6 -mt-16">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <img 
              src={creator.image} 
              alt={creator.name}
              className="w-32 h-32 rounded-2xl object-cover border-4 border-background shadow-lg"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-heading text-3xl font-bold">{creator.name}</h1>
                <Badge variant="outline" className="font-mono text-lg px-3">
                  {creator.stock_symbol}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">{creator.category} Creator</p>
              
              {/* Stats */}
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
              </div>
            </div>

            <Button 
              data-testid="creator-subscribe-btn"
              onClick={handleSubscribe}
              variant={subscribed ? "outline" : "default"}
              className={`rounded-full px-8 ${!subscribed ? 'bg-primary text-white' : ''}`}
            >
              <Bell className={`w-4 h-4 mr-2 ${subscribed ? 'fill-current' : ''}`} />
              {subscribed ? 'Subscribed' : 'Subscribe'}
            </Button>
          </div>
        </div>
      </div>

      {/* Videos */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 mb-6">
          <TabsTrigger value="all" data-testid="creator-tab-all" className="rounded-full">
            All Videos ({creator.videos?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredVideos?.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <Link 
                  key={video.video_id}
                  to={`/video/${video.video_id}`}
                  data-testid={`creator-video-${video.video_id}`}
                  className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-hover transition-all duration-300"
                >
                  <div className="relative aspect-video">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Duration badge */}
                    <Badge className="absolute top-3 right-3 bg-black/70 text-white border-0">
                      <Clock className="w-3 h-3 mr-1" />
                      {video.duration_minutes}m
                    </Badge>

                    {/* Stock price badge */}
                    <div className="absolute top-3 left-3 bg-secondary text-white px-2 py-1 rounded-lg text-sm font-mono font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      ${video.share_price.toFixed(2)}
                    </div>

                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-primary fill-primary ml-1" />
                      </div>
                    </div>

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-heading font-semibold text-white mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatNumber(video.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {formatNumber(video.likes)}
                        </span>
                      </div>
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
