import { useState } from 'react';
import { Bell, Search, User, LogOut, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProfile, useSearch } from '@/hooks/api';
import { toast } from 'sonner';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // API hooks
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: searchResults = [] } = useSearch(searchQuery);

  const handleLogout = () => {
    toast.success('Logged out successfully');
    // Implement actual logout logic here
  };

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search orders, menu..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(e.target.value.length > 0);
              }}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              className="w-64 pl-10 bg-secondary/50 border-transparent focus:border-gold/30 focus:bg-card"
            />
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.slice(0, 5).map((result, idx) => (
                  <div 
                    key={idx}
                    className="px-4 py-2 hover:bg-secondary/50 cursor-pointer text-sm border-b border-border last:border-b-0"
                  >
                    {result.name || result.client_name || result.supplier_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-[10px] font-bold text-primary-foreground rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-9 h-9 rounded-full bg-gold/10 hover:bg-gold/20"
                disabled={profileLoading}
              >
                {profileLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gold" />
                ) : (
                  <User className="w-5 h-5 text-gold" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {profile ? (
                <>
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-semibold text-sm">{profile.business_name || profile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{profile.email}</p>
                    {profile.city && (
                      <p className="text-xs text-muted-foreground">{profile.city}</p>
                    )}
                  </div>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  Loading profile...
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
