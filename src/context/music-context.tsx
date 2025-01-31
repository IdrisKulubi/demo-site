"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface MusicContextType {
  isPlaying: boolean;
  volume: number;
  toggleMusic: () => void;
  setVolume: (volume: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [audio] = useState(() =>
    typeof window !== "undefined" ? new Audio("/assets/audio/song.mp3") : null
  );

  useEffect(() => {
    if (audio) {
      audio.loop = true;
      audio.volume = volume;
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [audio, volume]);

  useEffect(() => {
    if (audio) {
      audio.volume = volume;
    }
  }, [volume, audio]);

  // Try to autoplay music
  useEffect(() => {
    if (audio) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const attemptPlay = async () => {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Failed to play audio:', error);
          // Silent fail - will require user interaction
          console.log('Music will play after user interaction');
        }
      };

      // attemptPlay(); // Commented out to stop auto-play

      // Also try to play on first interaction
      const handleInteraction = async () => {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Failed to play audio:', error);
        }
        // Remove listeners after first attempt
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      };

      document.addEventListener('click', handleInteraction);
      document.addEventListener('touchstart', handleInteraction);
      document.addEventListener('keydown', handleInteraction);

      return () => {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      };
    }
  }, [audio]);

  const toggleMusic = async () => {
    if (audio) {
      if (!isPlaying) {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Failed to play audio:', error);
        }
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <MusicContext.Provider value={{ isPlaying, volume, toggleMusic, setVolume }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
