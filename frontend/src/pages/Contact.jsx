import { useState } from "react";
import { useAuth, API } from "../App";
import { Card, CardContent } from "../components/ui/card";
import { CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Contact() {
  const auth = useAuth();
  const user = auth?.user;
  const nameParts = user?.name?.split(" ") || [];
  const [form, setForm] = useState({
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      await axios.post(`${API}/contact`, form);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8 max-w-3xl mx-auto">
      <Link
        to={user ? "/dashboard" : "/"}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>
      <p className="text-xs font-bold tracking-widest text-muted-foreground mb-4">READY TO GET STARTED?</p>
      <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight mb-8 leading-tight">
        Discover a new era of social media.<br />
        Reach out to start your journey today.
      </h1>

      <Card className="border-border/50">
        <CardContent className="p-6">
          {sent ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <p className="text-2xl font-bold mb-2">Message sent!</p>
              <p className="text-muted-foreground">We'll get back to you at {form.email}.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">First name <span className="text-destructive">*</span></label>
                  <input
                    required
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full rounded-full border border-border px-5 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Last name <span className="text-destructive">*</span></label>
                  <input
                    required
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full rounded-full border border-border px-5 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email <span className="text-destructive">*</span></label>
                  <input
                    required type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-full border border-border px-5 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-full border border-border px-5 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Message <span className="text-destructive">*</span></label>
                <textarea
                  required rows={5}
                  placeholder="Write your message here or contact us at info@ideaground.net"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full rounded-3xl border border-border px-5 py-4 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="bg-foreground text-background rounded-full px-10 py-4 text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
