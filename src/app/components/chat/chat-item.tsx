// "use client";

// import { redirect, useParams, useRouter } from "next/navigation";
// import { Member, User } from "../../../../db/schema";
// import ActionTooltip from "../action-tooltip";
// import { roleIconMap } from "../server-member";
// import UserAvatar from "../user-avatar";
// import Image from "next/image";
// import { Edit, FileIcon, Trash } from "lucide-react";
// import { useEffect, useState } from "react";
// import { cn } from "@/lib/utils";
// import z from "zod";
// import qs from "query-string";
// import axios from "axios";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { Input } from "@/components/ui/input";
// import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
// import { Button } from "@/components/ui/button";
// import { useModal } from "../../../../hooks/use-modal-store";

// interface ChatItemProps {
//   id: string;
//   content: string;
//   currentMember: Member;
//   timestamp: string;
//   fileUrl: string | null;
//   deleted: boolean;
//   isUpdated: boolean;
//   socketUrl: string;
//   socketQuery: Record<string, string>;
//   member?: Member & {
//     user: User;
//   };
// }

// const formSchema = z.object({
//   content: z.string().min(1),
// });

// export const ChatItem = ({
//   id,
//   content,
//   currentMember,
//   member,
//   timestamp,
//   fileUrl,
//   deleted,
//   isUpdated,
//   socketUrl,
//   socketQuery,
// }: ChatItemProps) => {
//   if (!member) {
//     return redirect("/me");
//   }
//   const [isEditing, setIsEditing] = useState(false);

//   const params = useParams();
//   const router = useRouter();

//   const { onOpen } = useModal();

//   const onMemberClick = () => {
//     if (member.id === currentMember.id) {
//       return;
//     }
//     router.push(`/me/servers/${params?.serverId}/conversations/${member.id}`);
//   };

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       content: content,
//     },
//   });

//   useEffect(() => {
//     form.reset({
//       content: content,
//     });
//   }, [content]);

//   useEffect(() => {
//     const handleKeyDown = (event: any) => {
//       if (event.key === "Escape" || event.keyCode === 27) {
//         setIsEditing(false);
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);

//     return () => window.removeEventListener("keydown", handleKeyDown);
//   });

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     try {
//       const url = qs.stringifyUrl({
//         url: `${socketUrl}/${id}`,
//         query: socketQuery,
//       });

//       await axios.patch(url, values);
//       form.reset();
//       setIsEditing(false);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const fileType = fileUrl?.split(".").pop();

//   const isAdmin = currentMember.role === "ADMIN";
//   const isModerator = currentMember.role === "MODERATOR";
//   const isOwner = currentMember.id === member.id;
//   const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
//   const canEditMessage = !deleted && isOwner;

//   const isLoading = form.formState.isSubmitting;

//   const isPdf = fileType === "pdf" && fileUrl;
//   const isImage = !isPdf && fileUrl;
//   return (
//     <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
//       <div className="group flex gap-x-2 items-start w-full">
//         <div
//           onClick={onMemberClick}
//           className="cursor-pointer hover:drop-shadow-md transition"
//         >
//           <UserAvatar src={member?.user?.imageUrl || ""} />
//         </div>
//         <div className="flex flex-col w-full">
//           <div className="flex items-center gap-x-2">
//             <div className="flex items-center">
//               <p
//                 onClick={onMemberClick}
//                 className="font-semibold text-sm hover:underline cursor-pointer"
//               >
//                 {member?.user?.name}
//               </p>
//               <ActionTooltip label={member?.role}>
//                 {roleIconMap[member?.role]}
//               </ActionTooltip>
//             </div>
//             <span className="text-xs text-zinc-500 dark:text-zinc-400">
//               {timestamp}
//             </span>
//           </div>
//           {isImage && (
//             <a
//               href={fileUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
//             >
//               <Image
//                 src={fileUrl}
//                 alt={content}
//                 fill
//                 className="object-cover"
//               />
//             </a>
//           )}

//           {isPdf && (
//             <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
//               <FileIcon className="h-10 w-10 fill-indogo-200 stroke-indogo-400" />
//               <a
//                 href={fileUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
//               >
//                 PDF file
//               </a>
//             </div>
//           )}
//           {!fileUrl && !isEditing && (
//             <p
//               className={cn(
//                 "text-sm text-zinc-600 dark:text-zinc-300",
//                 deleted &&
//                   "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
//               )}
//             >
//               {content}
//               {isUpdated && !deleted && (
//                 <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
//                   (edited)
//                 </span>
//               )}
//             </p>
//           )}
//           {!fileUrl && isEditing && (
//             <Form {...form}>
//               <form
//                 onSubmit={form.handleSubmit(onSubmit)}
//                 className="flex items-center w-full gap-x-2 pt-2"
//               >
//                 <FormField
//                   control={form.control}
//                   name="content"
//                   render={({ field }) => (
//                     <FormItem className="flex-1">
//                       <FormControl>
//                         <div className="relative w-full">
//                           <Input
//                             disabled={isLoading}
//                             className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
//                             placeholder="Edited message"
//                             {...field}
//                           />
//                         </div>
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />
//                 <Button disabled={isLoading} size="sm" variant={"primary"}>
//                   Save
//                 </Button>
//               </form>
//               <span className="text-[10px] mt-1 text-zinc-400">
//                 Press Esc to cancel and Enter to Save
//               </span>
//             </Form>
//           )}
//         </div>
//       </div>

//       {canDeleteMessage && (
//         <div className="hidden group-hover:flex! items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
//           {canEditMessage && (
//             <ActionTooltip label="Edit">
//               <Edit
//                 className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-300 transition"
//                 onClick={() => setIsEditing(true)}
//               />
//             </ActionTooltip>
//           )}

//           <ActionTooltip label="Delete">
//             <Trash
//               className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-300 transition"
//               onClick={() =>
//                 onOpen("deleteMessage", {
//                   apiUrl: `${socketUrl}/${id}`,
//                   query: socketQuery,
//                 })
//               }
//             />
//           </ActionTooltip>
//         </div>
//       )}
//     </div>
//   );
// };

"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ActionTooltip from "../action-tooltip";
import { roleIconMap } from "../server-member";
import UserAvatar from "../user-avatar";
import Image from "next/image";
import { Edit, FileIcon, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import z from "zod";
import qs from "query-string";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Member, User } from "../../../../db/schema";
import { useModal } from "../../../../hooks/use-modal-store";

const formSchema = z.object({
  content: z.string().min(1),
});

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮"];

interface ReadReceipt {
  memberId: string;
  readAt: string;
  user?: User;
}

export const ChatItem = ({
  id,
  content,
  currentMember,
  member,
  timestamp,
  fileUrl,
  deleted,
  isUpdated,
  socketUrl,
  socketQuery,
  reactions = [],
  isOnline = false,
}: {
  id: string;
  content: string;
  currentMember: Member;
  member?: Member & { user: User };
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
  reactions?: string[];
  isOnline?: boolean;
}) => {
  const router = useRouter();
  const params = useParams();
  const { onOpen } = useModal();

  const [isEditing, setIsEditing] = useState(false);
  const [hovered, setHovered] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { content },
  });

  if (!member) return null;

  const isOwner = currentMember.id === member.id;
  const isAdmin = currentMember.role === "ADMIN";
  const isModerator = currentMember.role === "MODERATOR";
  const canEditMessage = !deleted && isOwner;
  const canDeleteMessage = !deleted && (isOwner || isAdmin || isModerator);

  const isPdf = fileUrl?.endsWith(".pdf");
  const isImage = fileUrl && !isPdf;
  const isLoading = form.formState.isSubmitting;

  const groupedReactions: Record<string, { count: number; userIds: string[] }> =
    {};
  reactions.forEach((r) => {
    const [emoji, userId] = r.split(":");
    if (!groupedReactions[emoji]) {
      groupedReactions[emoji] = { count: 0, userIds: [] };
    }
    groupedReactions[emoji].count++;
    groupedReactions[emoji].userIds.push(userId);
  });

  const handleEmojiReaction = async (emoji: string) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}/reaction`,
        query: socketQuery,
      });
      await axios.post(url, { emoji });
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      });
      await axios.patch(url, values);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={cn(
        "relative group flex items-start w-full transition p-4 gap-2",
        "hover:bg-black/5 dark:hover:bg-white/5 rounded-lg",
        isOwner && "flex-row-reverse"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar with online indicator */}
      <div
        onClick={() =>
          member.id !== currentMember.id &&
          router.push(
            `/me/servers/${params?.serverId}/conversations/${member.id}`
          )
        }
        className="cursor-pointer hover:drop-shadow-md transition flex-shrink-0 relative"
      >
        <UserAvatar src={member.user.imageUrl || ""} />
        {/* Online status indicator */}
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
        )}
      </div>

      {/* Message content wrapper */}
      <div
        className={cn(
          "flex flex-col max-w-[70%] min-w-[100px]",
          isOwner && "items-end"
        )}
      >
        {/* Name + timestamp + role (only for non-owner messages) */}
        {!isOwner && (
          <div className="flex items-center gap-2 mb-1 px-2">
            <p className="font-semibold text-sm hover:underline cursor-pointer">
              {member.user.name}
            </p>
            <ActionTooltip label={member.role}>
              {roleIconMap[member.role]}
            </ActionTooltip>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
        )}

        {/* Message bubble with reactions */}
        <div className="relative">
          <div
            className={cn(
              "relative px-4 py-2 rounded-2xl transition-all duration-200 shadow-sm",
              isOwner
                ? "bg-indigo-600 dark:bg-indigo-700 text-white rounded-tr-sm"
                : "bg-gray-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-tl-sm"
            )}
          >
            {/* File preview */}
            {isImage && (
              <a
                href={fileUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md overflow-hidden mb-2 border"
              >
                <Image
                  src={fileUrl!}
                  alt="Image"
                  width={200}
                  height={200}
                  className="object-cover"
                />
              </a>
            )}

            {isPdf && (
              <div className="flex items-center gap-2 p-2 bg-black/10 dark:bg-white/10 rounded-md mb-2">
                <FileIcon className="w-6 h-6 text-indigo-500" />
                <a
                  href={fileUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "hover:underline text-sm",
                    isOwner
                      ? "text-white"
                      : "text-indigo-600 dark:text-indigo-400"
                  )}
                >
                  View PDF
                </a>
              </div>
            )}

            {/* Message text */}
            {!fileUrl && !isEditing && (
              <p className={cn(deleted && "italic text-gray-400 text-xs")}>
                {content}
                {isUpdated && !deleted && (
                  <span className="text-[10px] ml-2 opacity-70">(edited)</span>
                )}
              </p>
            )}

            {/* Edit input */}
            {isEditing && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex items-center gap-2"
                >
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isLoading}
                            placeholder="Edit message..."
                            className={cn(
                              "text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                              isOwner
                                ? "bg-white/20 text-white placeholder:text-white/70"
                                : "bg-zinc-100 dark:bg-zinc-600"
                            )}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    size="sm"
                    disabled={isLoading}
                    variant={isOwner ? "secondary" : "default"}
                    className="h-8"
                  >
                    Save
                  </Button>
                </form>
              </Form>
            )}

            {/* Quick emoji bar on hover */}
            {!deleted && hovered && !isEditing && (
              <div
                className={cn(
                  "absolute -top-9 flex gap-1 px-2 py-1 rounded-full border shadow-lg bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 z-10",
                  isOwner ? "right-0" : "left-0"
                )}
              >
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiReaction(emoji)}
                    className="text-base hover:scale-125 transition-transform p-1"
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reaction emoji bubble */}
          {Object.keys(groupedReactions).length > 0 && !deleted && (
            <div
              className={cn(
                "absolute -bottom-5 flex gap-1 bg-white dark:bg-zinc-800 rounded-full shadow-md px-2 py-0.5 border border-gray-200 dark:border-zinc-700 z-10",
                isOwner ? "right-2" : "left-2"
              )}
            >
              {Object.entries(groupedReactions).map(([emoji, data]) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiReaction(emoji)}
                  className={cn(
                    "flex items-center gap-0.5 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full px-1 transition",
                    data.userIds.includes(currentMember.userId) &&
                      "bg-indigo-100 dark:bg-indigo-900/30"
                  )}
                  type="button"
                >
                  <span className="text-sm">{emoji}</span>
                  {data.count > 1 && (
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                      {data.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp for owner messages */}
        {isOwner && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 px-2">
            {timestamp}
          </span>
        )}
      </div>

      {/* Edit/Delete buttons */}
      {(canEditMessage || canDeleteMessage) && (
        <div
          className={cn(
            "absolute top-4 flex items-center gap-1 p-1 bg-white dark:bg-zinc-800 border rounded-md shadow-md opacity-0 group-hover:opacity-100 transition",
            isOwner ? "left-14" : "right-14"
          )}
        >
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
                type="button"
              >
                <Edit className="w-4 h-4 text-zinc-500 dark:text-zinc-300" />
              </button>
            </ActionTooltip>
          )}
          {canDeleteMessage && (
            <ActionTooltip label="Delete">
              <button
                onClick={() =>
                  onOpen("deleteMessage", {
                    apiUrl: `${socketUrl}/${id}`,
                    query: socketQuery,
                  })
                }
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
                type="button"
              >
                <Trash className="w-4 h-4 text-zinc-500 dark:text-zinc-300" />
              </button>
            </ActionTooltip>
          )}
        </div>
      )}
    </div>
  );
};
