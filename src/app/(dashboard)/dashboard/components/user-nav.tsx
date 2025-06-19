"use client";

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function UserNav() {
  const router = useRouter();
  const [avatarFallback, setAvatarFallback] = useState("");
  const { user } = useUser();

  const pathname = usePathname();

  useEffect(() => {
    if (user?.fullName) {
      const initials = user.fullName
        .split(" ")
        .map((name) => name[0])
        .join("");
      setAvatarFallback(initials);
    }
  }, [user?.fullName]);



  if (!user) {
    return (
      <SignInButton mode="modal" fallbackRedirectUrl={pathname}>
        <Button>Sign In</Button>
      </SignInButton>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl} alt="@username" />
            <AvatarFallback>{avatarFallback || "..."}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.emailAddresses[0].emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/workouts")}>
          My Plans
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard")}>
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2">
          <LogOutIcon className="h-4 w-4" />
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
