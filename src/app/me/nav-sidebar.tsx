import { MessageSquare } from "lucide-react";
import { getSession } from "../../../lib/auth-utils";
import { redirect } from "next/navigation";
import db from "../../../db/drizzle";
import { members, servers } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { NavigationAction } from "../components/navigaton-action";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationItem } from "../components/navigation-item";
import { FriendsList } from "../components/FriendsList";

export default async function Sidebar() {
  const profile = await getSession();
  if (!profile) {
    return redirect("/auth/sign-in");
  }

  const serverResults = await db
    .select()
    .from(servers)
    .innerJoin(members, eq(servers.id, members.serverId))
    .where(eq(members.userId, profile.id));

  return (
    <aside className="fixed  left-0 top-0 w-18 h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 z-50">
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
        <div
          className="
            group p-2 rounded-lg 
            transition-all duration-300 ease-in-out
            hover:bg-gray-100 dark:hover:bg-gray-800
            hover:scale-110
            cursor-pointer
          "
        >
          <MessageSquare
            className="
              w-6 h-6 
              text-gray-700 dark:text-gray-300 
              group-hover:text-blue-600 dark:group-hover:text-blue-400
              transition-colors duration-300
            "
          />
        </div>
      </div>
      <div className="space-y-4 flex flex-col items-center h-full text-primary w-full dark:bg-[#1E1F22] py-3">
        <NavigationAction />
        <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md w-10 mx-auto mt-1" />
        <ScrollArea className="flex-1 w-full">
          {serverResults.map((server) => (
            <div key={server.servers.id} className="mb-4">
              <NavigationItem
                id={server.servers.id}
                name={server.servers.name}
                imageUrl={server.servers.imageUrl}
              />
            </div>
          ))}
          <FriendsList userId={profile?.id} />
        </ScrollArea>
      </div>
    </aside>
  );
}
