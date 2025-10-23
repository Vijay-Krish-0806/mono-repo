"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "../../../lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, User } from "lucide-react";
import { ModeToggle } from "../components/toggle";
import { NotificationBell } from "../components/NotificationBell";
import { UserSearch } from "../components/UserSearch";
import { FriendRequests } from "../components/FriendsRequest";

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="fixed  top-0 left-0 right-0 h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 z-20">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center" />
        <UserSearch userId={session?.user.id!} />

        {/* Right Section - User info and actions */}
        <div className="flex items-center gap-3">
          <FriendRequests userId={session?.user?.id!} />

          <ModeToggle />

          {isPending ? (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : session ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-900">
                <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {session.user.name || session.user.email}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                disabled={loading}
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </>
                )}
              </Button>

              {session.user.id && <NotificationBell userId={session.user.id} />}
            </>
          ) : (
            <Link href="/auth/sign-in">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
