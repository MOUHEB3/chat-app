//sounds for reveiving messages and notifications//

import sound from "./sound.wav";
import chat from "./chat.mp3";
const audioRef = new Audio();
const Ring = () => {
  audioRef.src = sound;
  audioRef
    .play()
    .then(() => {})
    .catch((error) => {
      console.error("Error playing sound:", error);
    });
};

const Chatsound = () => {
  audioRef.src = chat;
  audioRef
    .play()
    .then(() => {})
    .catch((error) => {
      console.error("Error playing sound:", error);
    });
};

export { Ring, Chatsound };
