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
import { 
  Video, Upload, Plus, Eye, Heart, DollarSign,
  Users, Play, Sparkles, BarChart3
} from "lucide-react";

export default function CreatorStudio() {
  const { user } = useAuth();
  const [creatorData, setCreatorData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Become creator form
  const [becomeCreatorOpen, setBecomeCreatorOpen] = useState(false);
  const [creatorName, setCreatorName] = useState("");
  const [creatorCategory, setCreatorCategory] = useState("");
  const [creatorImage, setCreatorImage] = useState("");
  const [becomingCreator, setBecomingCreator] = useState(false);
  
  // Upload video form
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoFilePath, setVideoFilePath] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState("");
  const [videoCategory, setVideoCategory] = useState("");
  const [videoType, setVideoType] = useState("full");
  const [videoDuration, setVideoDuration] = useState(null);
  const [r2VideoKey, setR2VideoKey] = useState(null);
  const [r2ThumbKey, setR2ThumbKey] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const categories = [
    "Dance", "Podcast", "Travel", "Tech", "Food", "Gaming", 
    "Music", "Education", "Fitness", "Comedy", "Lifestyle", "Other"
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

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    setUploadingFile(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(`${API}/videos/upload-file`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setVideoFilePath(response.data.video_file_path);
      if (response.data.r2_video_key) setR2VideoKey(response.data.r2_video_key);
      if (response.data.r2_thumb_key) setR2ThumbKey(response.data.r2_thumb_key);
      if (response.data.thumbnail_path) setVideoThumbnail(response.data.thumbnail_path);
      if (response.data.suggested_video_type) setVideoType(response.data.suggested_video_type);
      if (response.data.duration != null) setVideoDuration(response.data.duration);
      toast.success("Video uploaded!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "File upload failed");
      setVideoFile(null);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleUploadVideo = async () => {
    if (!videoTitle.trim() || !videoDescription.trim() || !videoFilePath || !videoCategory) {
      toast.error("Please fill in all required fields and upload a video file");
      return;
    }

    setUploading(true);
    try {
      const response = await axios.post(
        `${API}/videos/upload`,
        {
          title: videoTitle,
          description: videoDescription,
          thumbnail: videoThumbnail || undefined,
          thumbnail_path: videoThumbnail?.startsWith("/data/") ? videoThumbnail : undefined,
          video_file_path: videoFilePath,
          r2_video_key: r2VideoKey || undefined,
          r2_thumb_key: r2ThumbKey || undefined,
          video_type: videoType,
          category: videoCategory
        },
        { withCredentials: true }
      );
      toast.success(`Video published! Ticker: ${response.data.video.ticker_symbol} | Price: $${response.data.video.share_price.toFixed(2)}`);
      setUploadDialogOpen(false);
      setVideoFile(null);
      setVideoFilePath("");
      setUploadProgress(0);
      setVideoTitle("");
      setVideoDescription("");
      setVideoThumbnail("");
      setVideoCategory("");
      setR2VideoKey(null);
      setR2ThumbKey(null);
      fetchCreatorData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to publish video");
    } finally {
      setUploading(false);
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
              <Badge variant="outline" className="font-mono">${creator.stock_symbol}</Badge>
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
                  <Label>Video File *</Label>
                  <label className="mt-1 border-2 border-dashed border-border rounded-xl p-6 text-center block cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors">
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {videoFile ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium truncate">{videoFile.name}</p>
                        {uploadingFile ? (
                          <div className="space-y-1">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs text-secondary">✓ Ready</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to select a video file</p>
                        <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WebM supported</p>
                      </div>
                    )}
                  </label>
                </div>
                <div>
                  <Label htmlFor="video-title">Title *</Label>
                  <Input
                    id="video-title"
                    data-testid="video-title-input"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Video title"
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
                  <Label>Video Type</Label>
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setVideoType("full")}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        videoType === "full"
                          ? "bg-primary text-white border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      Full Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoType("short")}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        videoType === "short"
                          ? "bg-primary text-white border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      Short
                    </button>
                  </div>
                  {videoFilePath && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-detected: <span className="font-medium">{videoType === "short" ? "Short" : "Full Video"}</span>
                      {videoDuration != null && (
                        <span> ({Math.round(videoDuration)}s{videoDuration > 180 ? " — over 3 min limit" : ""})</span>
                      )}
                      {" "}— tap to change
                    </p>
                  )}
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
                  <Label>Share Price (USD)</Label>
                  <Input value="$1.00" disabled className="mt-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mt-1">
                    All shares are currently priced at $1.00.
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
                <div key={video.video_id} className="group relative overflow-hidden rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <Link
                  to={`/video/${video.video_id}`}
                  data-testid={`my-video-${video.video_id}`}
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

                    <Badge className="absolute top-2 left-2 bg-secondary text-white border-0 font-mono text-xs">
                      {video.ticker_symbol}
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
                </div>
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
