import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Search, Play, Eye, Heart, Clock, TrendingUp, Users, Sparkles,
  Mic, Music, Palette, GraduationCap, MoreHorizontal, Utensils, Plane, Cpu, RefreshCw
} from "lucide-react";
import { useDataSync, POLL_INTERVALS } from "../hooks/useDataSync";

export default function Explore() {
  const [videos, setVideos] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("videos");
  const [selectedGenre, setSelectedGenre] = useState("all");

  // Genre categories like stock market sectors
  const genres = [
    { id: "all", label: "All", icon: Sparkles },
    { id: "Podcast", label: "Podcast", icon: Mic },
    { id: "Dance", label: "Music & Dance", icon: Music },
    { id: "Tech", label: "Tech & Tutorial", icon: Cpu },
    { id: "Food", label: "Food & Lifestyle", icon: Utensils },
    { id: "Travel", label: "Travel & Vlog", icon: Plane },
    { id: "Art", label: "Art & Decor", icon: Palette },
    { id: "Other", label: "Others", icon: MoreHorizontal },
  ];

  const fetchData = useCallback(async () => {
    try {
      const [videosRes, creatorsRes] = await Promise.all([
        axios.get(`${API}/videos`, { withCredentials: true }),
        axios.get(`${API}/creators`, { withCredentials: true })
      ]);
      setVideos(videosRes.data);
      setCreators(creatorsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (loading) toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh polling (every 15 seconds)
  // TODO: Replace with WebSocket for real-time updates
  const { refresh: manualRefresh, lastUpdated } = useDataSync(
    fetchData,
    POLL_INTERVALS.NORMAL,
    !loading
  );

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.creator?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "all" || video.category === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const filteredCreators = creators.filter(creator =>
    creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center orange-gradient-subtle">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <span className="text-muted-foreground">Discovering content...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter p-6 lg:p-8 max-w-7xl mx-auto min-h-screen orange-gradient-subtle">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-1 gradient-text">Explore</h1>
        <p className="text-muted-foreground">Discover new content and creators</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60" />
        <Input
          data-testid="explore-search"
          type="text"
          placeholder="Search videos and creators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 rounded-xl text-lg"
        />
      </div>

      {/* Genre Filter - Like Stock Sectors */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Browse by Sector</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => {
            const Icon = genre.icon;
            const isActive = selectedGenre === genre.id;
            const count = genre.id === "all" 
              ? videos.length 
              : videos.filter(v => v.category === genre.id).length;
            
            return (
              <button
                key={genre.id}
                data-testid={`genre-${genre.id}`}
                onClick={() => setSelectedGenre(genre.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25' 
                    : 'bg-white border border-border hover:border-orange-300 hover:bg-orange-50 text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {genre.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 mb-8">
          <TabsTrigger value="videos" data-testid="explore-tab-videos" className="rounded-full">
            Videos ({filteredVideos.length})
          </TabsTrigger>
          <TabsTrigger value="creators" data-testid="explore-tab-creators" className="rounded-full">
            Creators ({filteredCreators.length})
          </TabsTrigger>
        </TabsList>

        {/* Videos tab */}
        <TabsContent value="videos" className="mt-0">
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
              {filteredVideos.map((video) => (
                <Link 
                  key={video.video_id}
                  to={`/video/${video.video_id}`}
                  data-testid={`explore-video-${video.video_id}`}
                  className="group overflow-hidden rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Thumbnail with minimal overlays */}
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Duration badge - bottom right */}
                    <div className="absolute bottom-2 right-2">
                      <Badge className="bg-black/80 text-white border-0 text-xs px-1.5 py-0.5">
                        {video.duration_minutes}:00
                      </Badge>
                    </div>

                    {/* Play overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div className="w-14 h-14 rounded-full bg-black/70 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Video Info - Below thumbnail */}
                  <div className="p-3">
                    {/* Title and Price Row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-sm line-clamp-2 leading-snug flex-1">
                        {video.title}
                      </h3>
                      {/* Price badge */}
                      <div className={`flex-shrink-0 px-2 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1 ${
                        (video.last_price_change_percent || 0) >= 0 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {(video.last_price_change_percent || 0) >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        ${video.share_price.toFixed(2)}
                      </div>
                    </div>

                    {/* Creator info */}
                    {video.creator && (
                      <div className="flex items-center gap-2 mb-2">
                        <img 
                          src={video.creator.image} 
                          alt={video.creator.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-sm text-muted-foreground truncate">{video.creator.name}</span>
                      </div>
                    )}

                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {formatNumber(video.views)} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        {formatNumber(video.likes)}
                      </span>
                      {video.video_type === 'short' && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                          <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                          Short
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-primary/30 mb-4" />
              <h3 className="font-heading font-semibold mb-2">No videos found</h3>
              <p className="text-muted-foreground">Try a different search term</p>
            </div>
          )}
        </TabsContent>

        {/* Creators tab */}
        <TabsContent value="creators" className="mt-0">
          {filteredCreators.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreators.map((creator) => (
                <Link 
                  key={creator.creator_id}
                  to={`/creator/${creator.creator_id}`}
                  data-testid={`explore-creator-${creator.creator_id}`}
                  className="group"
                >
                  <Card className="border-border/50 hover:shadow-hover transition-all hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src={creator.image} 
                          alt={creator.name}
                          className="w-16 h-16 rounded-xl object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-semibold mb-1 truncate">{creator.name}</h3>
                          <p className="text-sm text-muted-foreground">{creator.category}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {formatNumber(creator.subscriber_count)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatNumber(creator.total_views)}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="font-mono">
                          {creator.stock_symbol}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-heading font-semibold mb-2">No creators found</h3>
              <p className="text-muted-foreground">Try a different search term</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
