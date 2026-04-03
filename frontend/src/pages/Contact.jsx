import { useState } from "react";
import { useAuth } from "../App";
import { Card, CardContent } from "../components/ui/card";
import { CheckCircle } from "lucide-react";

export default function Contact() {
  const { user } = useAuth();
  const nameParts = user?.name?.split(" ") || [];
  const [form, setForm] = useState({
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = `mailto:info@ideaground.net?subject=Contact from ${form.firstName} ${form.lastName}&body=${encodeURIComponent(form.message)}%0A%0APhone: ${form.phone}%0AEmail: ${form.email}`;
    setSent(true);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
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
              <button
                type="submit"
                className="bg-foreground text-background rounded-full px-10 py-4 text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Send
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
