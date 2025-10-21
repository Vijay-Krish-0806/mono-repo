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

// 'use client';

// import {
//   ControlBar,
//   GridLayout,
//   ParticipantTile,
//   RoomAudioRenderer,
//   useTracks,
//   RoomContext,
// } from '@livekit/components-react';
// import { Room, Track } from 'livekit-client';
// import '@livekit/components-styles';
// import { useEffect, useState } from 'react';

// export default function MediaRoom() {
//   // TODO: get user input for room and name
//   const room = 'quickstart-room';
//   const name = 'quickstart-user';
//   const [roomInstance] = useState(() => new Room({
//     // Optimize video quality for each participant's screen
//     adaptiveStream: true,
//     // Enable automatic audio/video quality optimization
//     dynacast: true,
//   }));

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const resp = await fetch(`/api/token?room=${room}&username=${name}`);
//         const data = await resp.json();
//         if (!mounted) return;
//         if (data.token) {
//           await roomInstance.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, data.token);
//         }
//       } catch (e) {
//         console.error(e);
//       }
//     })();

//     return () => {
//       mounted = false;
//       roomInstance.disconnect();
//     };
//   }, [roomInstance]);

//   if (token === '') {
//     return <div>Getting token...</div>;
//   }

//   return (
//     <RoomContext.Provider value={roomInstance}>
//       <div data-lk-theme="default" style={{ height: '100dvh' }}>
//         {/* Your custom component with basic video conferencing functionality. */}
//         <MyVideoConference />
//         {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
//         <RoomAudioRenderer />
//         {/* Controls for the user to start/stop audio, video, and screen share tracks */}
//         <ControlBar />
//       </div>
//     </RoomContext.Provider>
//   );
// }

// function MyVideoConference() {
//   // `useTracks` returns all camera and screen share tracks. If a user
//   // joins without a published camera track, a placeholder track is returned.
//   const tracks = useTracks(
//     [
//       { source: Track.Source.Camera, withPlaceholder: true },
//       { source: Track.Source.ScreenShare, withPlaceholder: false },
//     ],
//     { onlySubscribed: false },
//   );
//   return (
//     <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
//       {/* The GridLayout accepts zero or one child. The child is used
//       as a template to render all passed in tracks. */}
//       <ParticipantTile />
//     </GridLayout>
//   );
// }
