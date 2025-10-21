import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  className?: string;
}

const UserAvatar = ({ src, name, className }: UserAvatarProps) => {
  const fallbackLetter = name && name.charAt(0).toUpperCase();

  return (
    <Avatar className={cn("h-7 w-7 md:h-10 md:w-10", className)}>
      <AvatarImage src={src || undefined} alt={name} />
      <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium">
        {fallbackLetter}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;