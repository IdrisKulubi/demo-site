"use client";

import { useState, useEffect } from "react";
import { HeartCrack } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitFeedback } from "@/lib/actions/feedback.actions";

export function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSeenModal, setHasSeenModal] = useState(true); // Start true to prevent flash
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has seen the modal before
    const hasSeenBefore = localStorage.getItem("hasSeenMaintenanceModal");
    if (!hasSeenBefore) {
      setHasSeenModal(false);
      setIsOpen(true);
      // Mark as seen
      localStorage.setItem("hasSeenMaintenanceModal", "true");
    }
  }, []);

  // Don't render anything if user has already seen the modal
  if (hasSeenModal) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!message.trim()) {
      toast({
        title: "Bruh... 🥲",
        description: "Type something before sending! I'm not a mind reader.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (/^(hi|hello|hey)/i.test(message)) {
      toast({
        title: "No cap 🧢",
        description: "Skip the greetings fam - just drop the issue!",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await submitFeedback(
        message,
        name || undefined,
        phoneNumber || undefined
      );
      if (result.error) throw new Error(result.error);

      toast({
        title: "Bet 🫶",
        description: "Your issue's been yeeted to my todo list!",
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
      <button onClick={() => setIsOpen(true)} className="relative group">
        <div className="transform transition-transform hover:scale-110">
          <HeartCrack className="h-5 w-5 sm:h-6 sm:w-6 text-rose-500/90 hover:text-rose-400 transition-colors" />
        </div>
        <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-purple-500 rounded-full ring-2 ring-background transform scale-0 group-hover:scale-100 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-start justify-center z-50 pointer-events-none p-2 sm:p-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out pointer-events-auto" />

          <div className="relative w-full max-w-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl border border-white/10 z-900 backdrop-blur-lg mx-auto transform transition-all duration-300 ease-in-out pointer-events-auto mt-16 max-h-[85vh] overflow-y-auto">
            {/* Header - Now with close button */}
            <div className="bg-gradient-to-br from-rose-500/20 to-pink-500/20 backdrop-blur-xl p-4 rounded-t-xl border-b border-white/10">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="text-3xl sm:text-4xl animate-bounce">🚀</div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                      Glow Up Alert! Our Servers Got Rizz Now ,they are now
                      behaving better
                    </h2>

                    <p className="text-sm sm:text-base text-fuchsia-200/90">
                      Fixed the laggy vibes - we&apos;re faster than my ex
                      moving on 😮💨
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-300 hover:text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Content - Remove ScrollArea component and its wrapper */}
            <div className="px-4">
              <div className="space-y-4 py-4">
                {/* Image Migration Notice */}
                <div className="flex items-start gap-3 bg-pink-50/30 dark:bg-pink-900/20 rounded-lg p-4">
                  <span className="text-xl flex-shrink-0">📸</span>
                  <div className="space-y-1">
                    <strong>Image Migration Notice</strong>
                    <div className="text-sm">
                      If your pics are not visible ,I&apos;m sorry ,might be
                      because of the migration, just delete & re-upload from
                      your profile section, I have migrated to a new storage to
                      manage all your profiles, you people are incredible and
                      you deserve the best,Continue sharing we get more people
                      to join the community
                      <div className="text-xs text-yellow-300 mt-1">
                        (Pro tip: Use the 🔄 button)
                      </div>
                    </div>
                  </div>
                </div>

                {/* TikTok Challenge with Valentine's Story */}
                <div className="bg-purple-50/30 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="text-center space-y-2">
                    <div className="text-lg font-medium">
                      💔 Plot Twist & Cash Drop Alert 🤑
                    </div>
                    <div className="text-sm space-y-2">
                      <div>
                        Fun fact: Was saving for V-day plans but she dipped
                        while I was fixing these servers for y&apos;all 😂
                      </div>
                      <div className="text-pink-300">
                        So now that money is going to the best StrathSpace
                        TikTok/IG with the most likes by Feb 14
                      </div>
                      <div className="text-sm opacity-75">
                        Create content about StrathSpace - most likes wins 🎥
                      </div>
                      <div className="text-xs mt-2 text-fuchsia-300">
                        Her loss = Your gain 💅 (At least the app works better
                        now lol)
                      </div>
                      <div className="text-xs mt-1">
                        Prize: That Valentine&apos;s Budget 💸 or Mystery Gift({" "}
                        <span className="text-xs text-red-600 ">
                          It&apos;s good money😉{" "}
                        </span>
                        ) 🎁
                      </div>
                      <div className="text-xs mt-1">Maybe It&apos;s you😉 </div>
                    </div>
                  </div>
                </div>

                {/* New Features */}
                <div className="flex items-start gap-3 bg-pink-50/30 dark:bg-pink-900/20 rounded-lg p-4">
                  <span className="text-xl flex-shrink-0">💌</span>
                  <div className="space-y-1">
                    <strong>Coming Soon</strong>
                    <div className="text-sm space-y-2">
                      <div>- Chat Feature 🌟</div>
                      <div>
                        - Profile Filters 🔍 (Filter by preferences & location)
                        You will be able to filter by location and preferences
                      </div>
                      <div>
                        -Mobile App 📱 (will come soon to Google Play & App
                        Store)
                      </div>
                      <div>- Any other feature you demand below</div>
                    </div>
                  </div>
                </div>

                {/* Feedback Section */}
                <div className="flex items-start gap-3 bg-purple-50/30 dark:bg-purple-900/20 rounded-lg p-4">
                  <span className="text-xl flex-shrink-0">👑</span>
                  <div className="space-y-1">
                    <strong>Y&apos;all Rule</strong>
                    <div className="text-sm">
                      This app&apos;s yours Demand features below or just say hi
                      👇
                      <div className="text-xs opacity-75 mt-1">
                        (I&apos;m just your tech bestie 🛠️)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feedback Form */}
                <form onSubmit={handleSubmit} className="space-y-3 mt-6">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border bg-black/20 px-3 py-2 text-sm ring-offset-background placeholder:text-rose-200/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/30"
                  />
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-md border bg-black/20 px-3 py-2 text-sm ring-offset-background placeholder:text-rose-200/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/30"
                  />
                  <textarea
                    placeholder="Leave me a message ..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-md border bg-black/20 px-3 py-2 text-sm ring-offset-background placeholder:text-rose-200/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/30 min-h-[100px] resize-none"
                    rows={3}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm hover:shadow-[0_0_20px_rgba(255,65,106,0.3)] py-2 px-4 transition-all duration-300 disabled:opacity-50"
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
