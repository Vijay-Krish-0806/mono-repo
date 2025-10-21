"use client";

import { useEffect, useState } from "react";

import { LiveKitRoom, VideoConference } from "@livekit/components-react";

import "@livekit/components-styles";
import { useSession } from "../../../lib/auth-client";
import { Loader2 } from "lucide-react";
import { User } from "../../../db/schema";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
  profileName: string;
}

export const MediaRoom = ({
  chatId,
  video,
  audio,
  profileName,
}: MediaRoomProps) => {
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!profileName) {
      console.log("no username media file");
      return;
    }
    const name = `${profileName}`;
    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit?room=${chatId}&username=${name}`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [profileName, profileName, chatId]);

  if (token === "") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={video}
      audio={audio}
    >
      <VideoConference />
    </LiveKitRoom>
  );
};
