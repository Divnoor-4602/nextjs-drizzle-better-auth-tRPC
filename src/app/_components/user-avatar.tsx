import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserAvatarProps = {
  data: {
    id: number;
    fullName: string;
    email?: string;
  };
  href?: string;
};

export function UserAvatar({ data, href }: UserAvatarProps) {
  const initials = data.fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avatarContent = (
    <Avatar className="h-8 w-8">
      <AvatarImage src="" alt={data.fullName} />
      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
    </Avatar>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-2 hover:opacity-80">
        {avatarContent}
        <span className="text-sm font-medium">{data.fullName}</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {avatarContent}
      <span className="text-sm font-medium">{data.fullName}</span>
    </div>
  );
}
