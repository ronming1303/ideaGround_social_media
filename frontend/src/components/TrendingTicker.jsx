import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../lib/utils";

export default function TrendingTicker() {
  const [tickerItems, setTickerItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicker();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTicker, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTicker = async () => {
    try {
      const response = await axios.get(`${API}/market-ticker`, { withCredentials: true });
      setTickerItems(response.data);
    } catch (error) {
      console.error("Error fetching ticker:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || tickerItems.length === 0) return null;

  // Duplicate items for seamless scrolling
  const duplicatedItems = [...tickerItems, ...tickerItems];

  return (
    <div className="w-full bg-card border-b border-border overflow-hidden">
      <div className="relative flex">
        <div 
          className="flex animate-ticker whitespace-nowrap py-2"
          style={{ animationDuration: `${tickerItems.length * 3}s` }}
        >
          {duplicatedItems.map((item, index) => (
            <Link
              key={`${item.symbol}-${index}`}
              to={`/video/${item.video_id}`}
              className="flex items-center gap-2 px-6 border-r border-border/30 hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <span className="font-mono font-semibold text-sm">{item.symbol}</span>
              <span className="text-sm text-muted-foreground">${item.price.toFixed(2)}</span>
              <span 
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  item.is_positive ? "text-secondary" : "text-destructive"
                )}
              >
                {item.is_positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {item.is_positive ? "+" : ""}{item.change_percent.toFixed(1)}%
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
