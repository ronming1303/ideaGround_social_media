import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import {
  Video, Upload, Plus, Eye, Heart, DollarSign,
  Users, Play, Sparkles, BarChart3, Megaphone, Send, Pencil, Check, X
} from "lucide-react";

export default function CreatorStudio() {
  const { user } = useAuth();
  const [creatorData, setCreatorData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [application, setApplication] = useState(undefined);
  const [appBio, setAppBio] = useState("");
  const [appReason, setAppReason] = useState("");
  const [submittingApp, setSubmittingApp] = useState(false);

  // Become creator form
  const [becomeCreatorOpen, setBecomeCreatorOpen] = useState(false);
  const [becomingCreator, setBecomingCreator] = useState(false);
  
  // Bio
  const [bioText, setBioText] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [savingBio, setSavingBio] = useState(false);

  // Broadcast
  const [broadcastContent, setBroadcastContent] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);

  // Upload video form
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadQuota, setUploadQuota] = useState(null);
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

  const videoCategories = [
    "Art", "Beauty & Fashion", "Comedy", "Dance", "Education", "Finance",
    "Fitness", "Food", "Gaming", "Lifestyle", "Music", "News & Politics",
    "Animals & Pets", "Podcast", "Sports", "Tech", "Travel", "Other",
    "Best of the Week", "Best of the Month"
  ];


  useEffect(() => {
    fetchCreatorData();
  }, []);

  const fetchCreatorData = async () => {
    try {
      const [creatorRes, appRes] = await Promise.all([
        axios.get(`${API}/creators/me`, { withCredentials: true }),
        axios.get(`${API}/creators/me/application`, { withCredentials: true }).catch(() => ({ data: { application: null } })),
      ]);
      setCreatorData(creatorRes.data);
      setApplication(appRes.data.application);
      if (creatorRes.data.is_creator) {
        setBioText(creatorRes.data.creator.bio || "");
        const bc = await axios.get(`${API}/creators/${creatorRes.data.creator.creator_id}/broadcasts`, { withCredentials: true });
        setBroadcasts(bc.data);
      }
    } catch (error) {
      console.error("Error fetching creator data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!appBio.trim() || !appReason.trim()) {
      toast.error("Please fill in both fields");
      return;
    }
    setSubmittingApp(true);
    try {
      const res = await axios.post(
        `${API}/creators/apply`,
        { bio: appBio, reason: appReason },
        { withCredentials: true }
      );
      setApplication(res.data.application);
      toast.success("Application submitted! We'll review it soon.");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to submit application");
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleOpenUploadDialog = async () => {
    try {
      const res = await axios.get(`${API}/creators/me/upload-quota`, { withCredentials: true });
      setUploadQuota(res.data);
      if (!res.data.can_upload) {
        const resetDate = new Date(res.data.resets_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
        toast.error(`Weekly upload limit reached. Quota resets on ${resetDate}.`);
        return;
      }
    } catch {
      // If quota check fails, let them try anyway
    }
    setUploadDialogOpen(true);
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      await axios.patch(`${API}/creators/me/bio`, { bio: bioText }, { withCredentials: true });
      setCreatorData(prev => ({ ...prev, creator: { ...prev.creator, bio: bioText } }));
      setEditingBio(false);
      toast.success("Bio updated!");
    } catch (error) {
      toast.error("Failed to update bio");
    } finally {
      setSavingBio(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastContent.trim()) return;
    setBroadcasting(true);
    try {
      const response = await axios.post(`${API}/creators/me/broadcasts`, { content: broadcastContent }, { withCredentials: true });
      setBroadcasts(prev => [response.data, ...prev]);
      setBroadcastContent("");
      toast.success("Broadcast sent!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to send broadcast");
    } finally {
      setBroadcasting(false);
    }
  };

  const handleBecomeCreator = async () => {
    setBecomingCreator(true);
    try {
      const response = await axios.post(
        `${API}/creators/become`,
        {},
        { withCredentials: true }
      );
      toast.success(`Welcome, ${response.data.creator.name}! Your stock symbol is $${response.data.creator.stock_symbol}`);
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
          
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfFOYaR0PU8ghHe0CCKU0FbW2qow3zyqcTdygS0hVn1Kud3PQ/viewform?usp=publish-editor"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              data-testid="become-creator-btn"
              className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-6 text-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Apply to Become a Creator
            </Button>
          </a>
          <p className="text-sm text-muted-foreground mt-4">
            Applications are reviewed within 3–5 business days.
          </p>
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
            <div className="mt-1">
              {editingBio ? (
                <div className="flex items-start gap-2">
                  <Textarea
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    placeholder="Write something about yourself..."
                    className="text-sm resize-none h-16"
                    maxLength={200}
                  />
                  <div className="flex flex-col gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveBio} disabled={savingBio}>
                      <Check className="w-4 h-4 text-green-500" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingBio(false); setBioText(creator.bio || ""); }}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setEditingBio(true)} className="flex items-center gap-1 group text-left">
                  <p className="text-sm text-muted-foreground">
                    {creator.bio || <span className="italic">Add a bio...</span>}
                  </p>
                  <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              )}
            </div>
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
            <Button
              data-testid="upload-video-btn"
              className="bg-primary text-white hover:bg-primary/90 rounded-full"
              onClick={handleOpenUploadDialog}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
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
                      {videoCategories.map((cat) => (
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

      <Tabs defaultValue="videos">
        <TabsList className="bg-muted/50 mb-6">
          <TabsTrigger value="videos" className="rounded-full">
            <Video className="w-3.5 h-3.5 mr-1.5" />
            Videos ({videos.length})
          </TabsTrigger>
          <TabsTrigger value="broadcasts" className="rounded-full">
            <Megaphone className="w-3.5 h-3.5 mr-1.5" />
            Broadcasts ({broadcasts.length})
          </TabsTrigger>
        </TabsList>

        {/* Broadcasts Tab */}
        <TabsContent value="broadcasts">
          <Card className="border-border/50">
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-3">
                <Textarea
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  placeholder="Send a message to your subscribers..."
                  rows={3}
                  maxLength={1000}
                  className="flex-1 resize-none"
                />
                <Button
                  onClick={handleBroadcast}
                  disabled={broadcasting || !broadcastContent.trim()}
                  className="bg-primary text-white hover:bg-primary/90 rounded-xl px-4 self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-right">{broadcastContent.length}/1000</p>
              {broadcasts.length > 0 ? (
                <div className="space-y-3 mt-2">
                  {broadcasts.map((b) => (
                    <div key={b.broadcast_id} className="p-4 rounded-xl bg-muted/40 border border-border/50">
                      <p className="text-sm whitespace-pre-wrap">{b.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(b.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No broadcasts yet. Send your first message to subscribers!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
