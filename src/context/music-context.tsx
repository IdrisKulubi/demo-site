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

  const toggleMusic = () => {
    if (audio) {
      if (!isPlaying) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <MusicContext.Provider
      value={{ isPlaying, volume, toggleMusic, setVolume }}
    >
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
