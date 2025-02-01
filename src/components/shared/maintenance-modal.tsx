"use client";

import { useState, useEffect } from "react";
import {  HeartCrack } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitFeedback } from "@/lib/actions/feedback.actions";

export function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Open the modal by default on mount
  useEffect(() => {
    setIsOpen(true);
  }, []);

  // Countdown timer
  useEffect(() => {
    const target = new Date();
    target.setDate(target.getDate() + 1);
    target.setHours(12, 0, 0, 0);

    const timer = setInterval(() => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!message.trim()) {
      toast({
        title: "Bruh... 🥲",
        description: "Type something before sending! I'm not a mind reader",
        variant: "destructive",
      });
      return;
    }

    if (/^(hi|hello|hey)/i.test(message)) {
      toast({
        title: "No cap 🧢",
        description: "Skip the greetings fam - just drop the issue!",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await submitFeedback(message, name || undefined, phoneNumber || undefined);

      if (result.error) throw new Error(result.error);

      toast({
        title: "Bet 🫶",
        description: "Your issue's been yeeted to my todo list",
      });

      setMessage("");
      setName("");
      setPhoneNumber("");
    } catch (error) {
      console.error("RIP feedback:", error);
      toast({
        title: "Big oof 😬",
        description: "My servers are crying rn - try again?",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative group"
      >
        <div className="transform transition-transform hover:scale-110">
          <HeartCrack className="h-5 w-5 sm:h-6 sm:w-6 text-rose-500/90 hover:text-rose-400 transition-colors" />
        </div>
        <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-purple-500 rounded-full ring-2 ring-background transform scale-0 group-hover:scale-100 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out pointer-events-auto" />
          
          <div className="relative w-full max-w-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 p-2 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl border border-white/10 z-900 backdrop-blur-lg mx-auto transform transition-all duration-300 ease-in-out pointer-events-auto mt-16">
           

            <div className="space-y-3 sm:space-y-4">
              {/* Crisis Header */}
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="text-3xl sm:text-4xl animate-bounce">⚡</div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    Sheeeesh We&apos;re Leveling Up 🔥
                  </h2>
                  <p className="text-sm sm:text-base text-fuchsia-200/90">
                    Major glow up in progress, bestie Back today @ 12PM
                  </p>
                </div>
              </div>

             

            <p className="text-sm sm:text-base text-fuchsia-200/90">
  Deployment is in the pipeline! 🚀 We’re rolling out the update in just a few minutes. 
  Hang tight, bestie – we’ll be back before you know it! ⏳✨
</p>
              {/* Feedback Section */}
              <div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border bg-black/20 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm ring-offset-background placeholder:text-rose-200/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/30"
                  />
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-md border bg-black/20 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm ring-offset-background placeholder:text-rose-200/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/30"
                  />
                  <textarea
                    placeholder="Leave me  a message ..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-md border bg-black/20 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm ring-offset-background placeholder:text-rose-200/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/30"
                    rows={3}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs sm:text-sm hover:shadow-[0_0_20px_rgba(255,65,106,0.3)] py-1.5 px-3 sm:py-2 sm:px-4 transition-all duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin">🔄</span>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>Send Feedback</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
