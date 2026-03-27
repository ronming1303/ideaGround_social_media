import { useState, useRef } from "react";
import { useAuth, API } from "../App";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Camera, Save, Loader2 } from "lucide-react";

export default function UserProfile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewPicture, setPreviewPicture] = useState(null);
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewPicture(objectUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(`${API}/auth/me/avatar`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((prev) => ({ ...prev, picture: response.data.picture }));
      setPreviewPicture(null);
      URL.revokeObjectURL(objectUrl);
      toast.success("Avatar updated");
    } catch (err) {
      setPreviewPicture(null);
      URL.revokeObjectURL(objectUrl);
      toast.error(err.response?.data?.detail || "Failed to upload avatar");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name cannot be empty");
      return;
    }
    if (trimmed === user?.name) {
      toast.info("No changes to save");
      return;
    }
    setSaving(true);
    try {
      const response = await axios.patch(
        `${API}/auth/me`,
        { name: trimmed },
        { withCredentials: true }
      );
      setUser((prev) => ({ ...prev, name: response.data.name }));
      toast.success("Name updated");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update name");
    } finally {
      setSaving(false);
    }
  };

  const displayPicture = previewPicture || user?.picture;

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Avatar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="w-24 h-24 ring-2 ring-border">
              <AvatarImage src={displayPicture} alt={user?.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Click the camera icon to upload a new photo (JPEG, PNG, WebP, GIF)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Display Name</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
          />
          <Button
            onClick={handleSaveName}
            disabled={saving}
            className="w-full"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
        </CardContent>
      </Card>
    </div>
  );
}
