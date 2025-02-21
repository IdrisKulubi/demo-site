'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';

export function AdminNav() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-2">
          <Icons.logo className="h-8 w-8" />
          <span className="text-xl font-semibold">Admin Dashboard</span>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          <div className="flex items-center gap-2 text-sm">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback>
                {session?.user?.name?.[0]?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline-block">
              {session?.user?.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="text-destructive hover:text-destructive/80"
          >
            <Icons.logout className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
} 