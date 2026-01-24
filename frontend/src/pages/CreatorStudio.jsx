import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  Video, Upload, Plus, Eye, Heart, TrendingUp, DollarSign, 
  Users, Play, Settings, Sparkles, BarChart3
} from "lucide-react";

export default function CreatorStudio() {
  const { user } = useAuth();
  const [creatorData, setCreatorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreatorData();
  }, []);

  const fetchCreatorData = async () => {
    try {
      const response = await axios.get(`${API}/creators/me`, { withCredentials: true });
      setCreatorData(response.data);
    } catch (error) {
      console.error("Error fetching creator data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse text-muted-foreground text-center py-12">Loading...</div>
      </div>
    );
  }

  // Not a creator yet
  if (!creatorData?.is_creator) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold mb-4">Become a Creator</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start uploading videos and let your audience invest in your content. 
            Get your own stock symbol and watch your value grow!
          </p>
          
          <Button 
            data-testid="become-creator-btn"
            className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-6 text-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start Creating
          </Button>
        </div>
      </div>
    );
  }

  const creator = creatorData.creator;
  const videos = creator.videos || [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <img 
            src={creator.image} 
            alt={creator.name}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold">{creator.name}</h1>
              <Badge variant="outline" className="font-mono">{creator.stock_symbol}</Badge>
            </div>
            <p className="text-muted-foreground">{creator.category} Creator</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link to="/analytics">
            <Button 
              data-testid="view-analytics-btn"
              variant="outline"
              className="rounded-full"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </Link>
          
          <Button 
            data-testid="upload-video-btn"
            className="bg-primary text-white hover:bg-primary/90 rounded-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Video className="w-4 h-4" />
              <span className="text-sm">Videos</span>
            </div>
            <p className="font-heading text-2xl font-bold">{videos.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Subscribers</span>
            </div>
            <p className="font-heading text-2xl font-bold">{formatNumber(creator.subscriber_count)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Total Views</span>
            </div>
            <p className="font-heading text-2xl font-bold">{formatNumber(creator.total_views)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Avg Share Price</span>
            </div>
            <p className="font-heading text-2xl font-bold">
              ${videos.length > 0 
                ? (videos.reduce((sum, v) => sum + (v.share_price || 10), 0) / videos.length).toFixed(2)
                : "0.00"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Videos */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-heading">Your Videos</CardTitle>
        </CardHeader>
        <CardContent>
          {videos.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <Link 
                  key={video.video_id}
                  to={`/video/${video.video_id}`}
                  data-testid={`my-video-${video.video_id}`}
                  className="group relative overflow-hidden rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="aspect-video relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-black/70 text-white border-0">
                      {video.duration_minutes}m
                    </Badge>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium truncate">{video.title}</h4>
                    <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(video.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(video.likes)}
                      </span>
                      <span className="font-mono text-secondary">
                        ${video.share_price?.toFixed(2)}
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
              <p className="text-muted-foreground mb-4">Upload your first video to start building your audience</p>
              <Button 
                className="bg-primary text-white hover:bg-primary/90 rounded-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}