import { useState } from "react";
import { useAuth } from "../App";
import { Card, CardContent } from "../components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useForceLightTheme } from "../hooks/useForceLightTheme";
import { useTheme } from "../hooks/useTheme";

const CONTACT_EMAIL = "info@ideaground.net,contact@ideaground.net";

export default function Contact() {
  const auth = useAuth();
  const user = auth?.user;

  // Force light theme only when not logged in
  useForceLightTheme(!user);
  // Apply user's theme preference when logged in
  useTheme();

  const nameParts = user?.name?.split(" ") || [];
  const [form, setForm] = useState({
    firstName: nameParts[0] || "",
    lastName: nameParts.slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const subject = encodeURIComponent(`Contact from ${form.firstName} ${form.lastName}`);
    const body = encodeURIComponent(
`Name: ${form.firstName} ${form.lastName}
Email: ${form.email}
Phone: ${form.phone || 'Not provided'}

Message:
${form.message}`
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
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
                placeholder="Write your message here..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full rounded-3xl border border-border px-5 py-4 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="bg-foreground text-background rounded-full px-10 py-4 text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Open Email
              </button>
              <span className="text-sm text-muted-foreground">
                or email us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">info@ideaground.net</a>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
