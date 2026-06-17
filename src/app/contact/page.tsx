"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, Clock, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending
    setTimeout(() => {
      setLoading(false);
      toast.success("Message sent successfully! We'll get back to you soon.");
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
          Get in Touch
        </h1>
        <p className="text-lg text-muted-foreground">
          We're here to help! Whether you have a question about an order, a product, or just want to say hello, we'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Contact Info Cards */}
        <div className="space-y-8">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Phone Support */}
            <div className="bg-card border rounded-3xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Call Us</h3>
              <p className="text-muted-foreground mb-6">
                Talk to our dedicated support representative directly.
              </p>
              <div className="space-y-1">
                <p className="font-semibold text-lg">Ammar Shaikh</p>
                <a href="tel:7801986978" className="text-primary font-bold text-xl hover:underline">
                  +91 7801986978
                </a>
              </div>
            </div>

            {/* Email Support */}
            <div className="bg-card border rounded-3xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Email Us</h3>
              <p className="text-muted-foreground mb-6">
                Send us an email anytime and we'll reply within 24 hours.
              </p>
              <div className="space-y-1">
                <p className="font-semibold text-lg">Support Team</p>
                <a href="mailto:ammarshaikh6100@gmail.com" className="text-primary font-bold hover:underline">
                  ammarshaikh6100@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-3xl p-8 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold mb-6 border-b pb-4">Business Information</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Business Hours</p>
                  <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p className="text-muted-foreground">Saturday: 10:00 AM - 4:00 PM</p>
                  <p className="text-muted-foreground">Sunday: Closed</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold">Headquarters</p>
                  <p className="text-muted-foreground">123 Commerce Avenue</p>
                  <p className="text-muted-foreground">Tech District, Mumbai 400001</p>
                  <p className="text-muted-foreground">Maharashtra, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card border rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input required placeholder="John" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input required placeholder="Doe" className="h-12 rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input required type="email" placeholder="john@example.com" className="h-12 rounded-xl" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Order Number (Optional)</label>
              <Input placeholder="#ORD-12345" className="h-12 rounded-xl" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                required
                placeholder="How can we help you today?"
                className="min-h-[150px] resize-none rounded-xl"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base"
              disabled={loading}
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
