import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Bell, ArrowUpRight, ChevronRight, Video, Megaphone, Users, DollarSign } from "lucide-react";

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [unread, setUnread] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [subRes, unreadRes] = await Promise.all([
          axios.get(`${API}/subscriptions`, { withCredentials: true }),
          axios.get(`${API}/subscriptions/unread`, { withCredentials: true }),
        ]);
        setSubscriptions(subRes.data.subscriptions || []);
        setUnread(unreadRes.data || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleCreatorClick = useCallback(async (creatorId) => {
    if (!unread[creatorId]) return;
    try {
      await axios.post(`${API}/subscriptions/seen/${creatorId}`, {}, { withCredentials: true });
      setUnread(prev => {
        const next = { ...prev };
        delete next[creatorId];
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  }, [unread]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] orange-gradient-subtle">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <span className="text-muted-foreground">Loading subscriptions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter p-6 lg:p-8 max-w-3xl mx-auto min-h-screen orange-gradient-subtle">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold gradient-text">Subscriptions</h1>
        <p className="text-muted-foreground">Creators you follow</p>
      </div>

      {subscriptions.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">No subscriptions yet</h3>
            <p className="text-muted-foreground mb-4">
              Subscribe to creators to keep track of them here
            </p>
            <Link to="/explore">
              <Button className="rounded-full">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Explore Creators
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {subscriptions.map((creator) => {
                const counts = unread[creator.creator_id];
                return (
                  <Link
                    key={creator.creator_id}
                    to={`/creator/${creator.creator_id}`}
                    onClick={() => handleCreatorClick(creator.creator_id)}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      {creator.image ? (
                        <img
                          src={creator.image}
                          alt={creator.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                          <span className="font-bold text-primary text-lg">{creator.name?.charAt(0)}</span>
                        </div>
                      )}
                      {counts && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {counts.total > 9 ? "9+" : counts.total}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${counts ? "text-foreground" : ""}`}>{creator.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {creator.subscriber_count?.toLocaleString() ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          {creator.video_count ?? 0} videos
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${creator.total_revenue?.toFixed(0) ?? "0"}
                        </span>
                      </div>
                      {counts && (
                        <div className="flex items-center gap-3 text-xs text-primary mt-1">
                          {counts.videos > 0 && (
                            <span className="flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              {counts.videos} new video{counts.videos > 1 ? "s" : ""}
                            </span>
                          )}
                          {counts.broadcasts > 0 && (
                            <span className="flex items-center gap-1">
                              <Megaphone className="w-3 h-3" />
                              {counts.broadcasts} new broadcast{counts.broadcasts > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
