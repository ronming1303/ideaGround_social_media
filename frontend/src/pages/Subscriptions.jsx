import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Bell, ArrowUpRight, ChevronRight } from "lucide-react";

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axios.get(`${API}/subscriptions`, { withCredentials: true });
        setSubscriptions(response.data.subscriptions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

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
              {subscriptions.map((creator) => (
                <Link
                  key={creator.creator_id}
                  to={`/creator/${creator.creator_id}`}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  {creator.image ? (
                    <img
                      src={creator.image}
                      alt={creator.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-primary text-lg">{creator.name?.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{creator.name}</p>
                    {creator.category && (
                      <p className="text-sm text-muted-foreground truncate">{creator.category}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
