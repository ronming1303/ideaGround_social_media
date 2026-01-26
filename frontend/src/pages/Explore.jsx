import { useState, useEffect } from "react";
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
  Mic, Music, Palette, GraduationCap, MoreHorizontal, Utensils, Plane, Cpu
} from "lucide-react";

export default function Explore() {
  const [videos, setVideos] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("videos");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [videosRes, creatorsRes] = await Promise.all([
        axios.get(`${API}/videos`, { withCredentials: true }),
        axios.get(`${API}/creators`, { withCredentials: true })
      ]);
      setVideos(videosRes.data);
      setCreators(creatorsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.creator?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="relative mb-8">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
              {filteredVideos.map((video) => (
                <Link 
                  key={video.video_id}
                  to={`/video/${video.video_id}`}
                  data-testid={`explore-video-${video.video_id}`}
                  className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm card-hover-orange transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Fixed aspect ratio for all cards - 16:9 for uniformity */}
                  <div className="relative aspect-video">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Orange-tinted gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-orange-900/10"></div>
                    
                    {/* Top badges row */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      {/* Stock price badge */}
                      <div className={`px-3 py-1.5 rounded-lg text-sm font-mono font-bold flex items-center gap-1.5 backdrop-blur-sm shadow-lg ${
                        (video.last_price_change_percent || 0) >= 0 
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                          : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      }`}>
                        <TrendingUp className="w-3.5 h-3.5" />
                        ${video.share_price.toFixed(2)}
                      </div>
                      
                      {/* Duration & type badge */}
                      <div className="flex items-center gap-2">
                        {video.video_type === 'short' && (
                          <Badge className="bg-gradient-to-r from-primary to-orange-600 text-white border-0 backdrop-blur-sm shadow-md">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Short
                          </Badge>
                        )}
                        <Badge className="bg-black/60 text-white border-0 backdrop-blur-sm">
                          <Clock className="w-3 h-3 mr-1" />
                          {video.duration_minutes}m
                        </Badge>
                      </div>
                    </div>

                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform orange-glow-strong">
                        <Play className="w-7 h-7 text-white fill-white ml-1" />
                      </div>
                    </div>

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="font-heading font-semibold text-white mb-3 line-clamp-2 text-base leading-snug">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        {video.creator && (
                          <div className="flex items-center gap-2">
                            <img 
                              src={video.creator.image} 
                              alt={video.creator.name}
                              className="w-7 h-7 rounded-full object-cover border-2 border-orange-400/50"
                            />
                            <span className="text-sm text-white/90 font-medium">{video.creator?.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-xs text-white/70">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {formatNumber(video.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            {formatNumber(video.likes)}
                          </span>
                        </div>
                      </div>
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
