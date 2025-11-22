import { type ReactNode, useEffect, useState } from 'react';
import useSound from 'use-sound';
import { AudioContext } from '@/context/audio-context';
import musicFile from '@/assets/sounds/blocks.mp3';

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const [playMusic, { stop: stopMusic }] = useSound(musicFile, {
    volume: 0.1,
    loop: true,
    onplay: () => setIsPlaying(true),
    onstop: () => setIsPlaying(false),
    onend: () => setIsPlaying(false),
  });

  useEffect(() => {
    playMusic();
  }, [playMusic]);

  const handleOnSoundButtonClicked = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      playMusic();
    }
  };
  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        handleSound: handleOnSoundButtonClicked,
        playMusic,
        stopMusic,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
