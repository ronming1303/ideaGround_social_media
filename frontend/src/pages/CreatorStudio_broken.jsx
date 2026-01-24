import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Video, Upload, Plus, Eye, Heart, TrendingUp, DollarSign, 
  Users, Play, Settings, Sparkles, Image, BarChart3
} from "lucide-react";

export default function CreatorStudio() {
  const { user } = useAuth();
  const [creatorData, setCreatorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");
  
  // Become creator form
  const [becomeCreatorOpen, setBecomeCreatorOpen] = useState(false);
  const [creatorName, setCreatorName] = useState("");
  const [creatorCategory, setCreatorCategory] = useState("");
  const [creatorImage, setCreatorImage] = useState("");
  const [becomingCreator, setBecomingCreator] = useState(false);
  
  // Upload video form
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [videoType, setVideoType] = useState("full");
  const [videoCategory, setVideoCategory] = useState("");
  const [uploading, setUploading] = useState(false);

  const categories = [
    "Dance", "Podcast", "Travel", "Tech", "Food", "Gaming", 
    "Music", "Education", "Fitness", "Comedy", "Lifestyle", "Other"
  ];

  const thumbnailSuggestions = [
    "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800"
  ];

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

  const handleBecomeCreator = async () => {
    if (!creatorName.trim() || !creatorCategory) {
      toast.error("Please fill in all required fields");
      return;
    }

    setBecomingCreator(true);
    try {
      const response = await axios.post(
        `${API}/creators/become`,
        {
          name: creatorName,
          category: creatorCategory,
          image: creatorImage || user?.picture || ""
        },
        { withCredentials: true }
      );
      toast.success(`Welcome, ${response.data.creator.name}! Your stock symbol is ${response.data.creator.stock_symbol}`);
      setBecomeCreatorOpen(false);
      // Directly set the creator data to immediately show creator interface
      setCreatorData({
        is_creator: true,
        creator: { ...response.data.creator, videos: [] }
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to become creator");
    } finally {
      setBecomingCreator(false);
    }
  };

  const handleUploadVideo = async () => {
    if (!videoTitle.trim() || !videoDescription.trim() || !videoThumbnail || !videoDuration || !videoCategory) {
      toast.error("Please fill in all required fields");
      return;
    }

    const duration = parseInt(videoDuration);
    if (videoType === "short" && duration > 3) {
      toast.error("Shorts must be 3 minutes or less");
      return;
    }
    if (videoType === "full" && (duration < 10 || duration > 30)) {
      toast.error("Full videos must be between 10 and 30 minutes");
      return;
    }

    setUploading(true);
    try {
      const response = await axios.post(
        `${API}/videos/upload`,
        {
          title: videoTitle,
          description: videoDescription,
          thumbnail: videoThumbnail,
          video_url: videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ",
          duration_minutes: duration,
          video_type: videoType,
          category: videoCategory
        },
        { withCredentials: true }
      );
      toast.success("Video uploaded successfully! Initial share price: $" + response.data.video.share_price.toFixed(2));
      setUploadDialogOpen(false);
      resetUploadForm();
      fetchCreatorData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setVideoTitle("");
    setVideoDescription("");
    setVideoThumbnail("");
    setVideoUrl("");
    setVideoDuration("");
    setVideoType("full");
    setVideoCategory("");
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
          
          <Dialog open={becomeCreatorOpen} onOpenChange={setBecomeCreatorOpen}>
            <DialogTrigger asChild>
              <Button 
                data-testid="become-creator-btn"
                className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-6 text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Start Creating
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading">Create Your Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="creator-name">Creator Name *</Label>
                  <Input
                    id="creator-name"
                    data-testid="creator-name-input"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="e.g., Alex Gaming"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="creator-category">Category *</Label>
                  <Select value={creatorCategory} onValueChange={setCreatorCategory}>
                    <SelectTrigger data-testid="creator-category-select" className="mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="creator-image">Profile Image URL (optional)</Label>
                  <Input
                    id="creator-image"
                    data-testid="creator-image-input"
                    value={creatorImage}
                    onChange={(e) => setCreatorImage(e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
                <Button 
                  data-testid="confirm-become-creator-btn"
                  onClick={handleBecomeCreator}
                  disabled={becomingCreator}
                  className="w-full bg-primary text-white hover:bg-primary/90 rounded-full"
                >
                  {becomingCreator ? "Creating..." : "Become a Creator"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
          
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                data-testid="upload-video-btn"
                className="bg-primary text-white hover:bg-primary/90 rounded-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Upload New Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="video-title">Title *</Label>
                <Input
                  id="video-title"
                  data-testid="video-title-input"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Enter video title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="video-description">Description *</Label>
                <Textarea
                  id="video-description"
                  data-testid="video-description-input"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Describe your video..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label>Video Type *</Label>
                <div className="flex gap-2 mt-1">
                  <Button 
                    type="button"
                    variant={videoType === "short" ? "default" : "outline"}
                    onClick={() => setVideoType("short")}
                    className="flex-1 rounded-full"
                  >
                    Short (≤3 min)
                  </Button>
                  <Button 
                    type="button"
                    variant={videoType === "full" ? "default" : "outline"}
                    onClick={() => setVideoType("full")}
                    className="flex-1 rounded-full"
                  >
                    Full (10-30 min)
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="video-duration">Duration (minutes) *</Label>
                <Input
                  id="video-duration"
                  data-testid="video-duration-input"
                  type="number"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                  placeholder={videoType === "short" ? "1-3" : "10-30"}
                  min={videoType === "short" ? 1 : 10}
                  max={videoType === "short" ? 3 : 30}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="video-category">Category *</Label>
                <Select value={videoCategory} onValueChange={setVideoCategory}>
                  <SelectTrigger data-testid="video-category-select" className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="video-thumbnail">Thumbnail URL *</Label>
                <Input
                  id="video-thumbnail"
                  data-testid="video-thumbnail-input"
                  value={videoThumbnail}
                  onChange={(e) => setVideoThumbnail(e.target.value)}
                  placeholder="https://..."
                  className="mt-1"
                />
                <div className="flex gap-2 mt-2 flex-wrap">
                  {thumbnailSuggestions.slice(0, 3).map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setVideoThumbnail(url)}
                      className="w-16 h-10 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
                    >
                      <img src={url} alt={`Suggestion ${i+1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="video-url">Video URL (optional)</Label>
                <Input
                  id="video-url"
                  data-testid="video-url-input"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="YouTube embed URL (optional)"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Leave empty to use a placeholder video</p>
              </div>
              
              <div className="p-4 rounded-xl bg-accent">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Your video will start with 100 shares available for purchase. 
                  Initial share price is based on your subscriber count.
                </p>
              </div>

              <Button 
                data-testid="confirm-upload-btn"
                onClick={handleUploadVideo}
                disabled={uploading}
                className="w-full bg-primary text-white hover:bg-primary/90 rounded-full py-6"
              >
                {uploading ? "Uploading..." : "Upload Video"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                onClick={() => setUploadDialogOpen(true)}
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
