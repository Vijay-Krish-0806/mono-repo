"use client";

import { ServerWithMembersWithProfiles } from "@/types";
import { MemberRole } from "../../../db/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  ChevronDown,
  LogOut,
  PlusCircle,
  Settings,
  Trash,
  UserPlus,
  Users,
} from "lucide-react";
import { useModal } from "../../../hooks/use-modal-store";

interface ServerHeaderProps {
  server: ServerWithMembersWithProfiles;
  role?: MemberRole;
}

export const ServerHeader = ({ server, role }: ServerHeaderProps) => {
  const isAdmin = role === "ADMIN";
  const isModerator = isAdmin || role === "MODERATOR";
  const { onOpen } = useModal();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="focus:outline-none">
        <button className="w-full text-md font-semibold px-3 flex-items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition flex items-center">
          {server.name}
          <ChevronDown className="h-5 w-5 ml-auto" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 text-xs bg-black z-2 font-medium text-black dark:text-neutral-400 space-y-[2px]">
        {isModerator && (
          <DropdownMenuItem
            className="text-indigo-600 dark:text-indigo-400 px-3 py-2 text-sm cursor-pointer flex items-center"
            onClick={() => onOpen("invite", { server })}
          >
            Invite People
            <UserPlus className="h-4 w-4 ml-auto " />
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem
            className=" px-3 py-2 text-sm cursor-pointer flex items-center"
            onClick={() => onOpen("editServer", { server })}
          >
            Server Settings
            <Settings className="h-4 w-4 ml-auto " />
          </DropdownMenuItem>
        )}
        {isAdmin && (
          <DropdownMenuItem
            className=" px-3 py-2 text-sm cursor-pointer flex items-center"
            onClick={() => onOpen("members", { server })}
          >
            Manage Members
            <Users className="h-4 w-4 ml-auto " />
          </DropdownMenuItem>
        )}
        {isModerator && (
          <DropdownMenuItem
            className=" px-3 py-2 text-sm cursor-pointer flex items-center"
            onClick={() => onOpen("createChannel")}
          >
            Create Channel
            <PlusCircle className="h-4 w-4 ml-auto " />
          </DropdownMenuItem>
        )}

        {isModerator && <DropdownMenuSeparator />}

        {isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen("deleteServer", { server })}
            className="text-rose-500 px-3 py-2 text-sm cursor-pointer flex items-center"
          >
            Delete Server
            <Trash className="h-4 w-4 ml-auto " />
          </DropdownMenuItem>
        )}
        {!isAdmin && (
          <DropdownMenuItem
            onClick={() => onOpen("leaveServer", { server })}
            className="text-rose-500 px-3 py-2 text-sm cursor-pointer flex items-center"
          >
            Leave Server
            <LogOut className="h-4 w-4 ml-auto " />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
