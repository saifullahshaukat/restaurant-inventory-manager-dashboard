import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useNotifications } from '@/hooks/use-notifications';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // API hooks
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: searchResults = [] } = useSearch(searchQuery);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate based on type
    if (notification.reference_type === 'Order' && notification.reference_id) {
      navigate(`/orders/${notification.reference_id}`);
    } else if (notification.reference_type === 'Inventory' && notification.reference_id) {
      navigate('/inventory'); // Or specific item if route exists
    } else if (notification.type === 'Alert') {
      // Go to where alerts might be relevant, maybe dashboard or inventory
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          {/* Display Business Name if available */}
          {profile?.name && (
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
              {profile.name}
            </p>
          )}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-gold text-[10px] font-bold text-primary-foreground rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <h4 className="font-semibold text-sm">Notifications</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gold h-auto p-0 hover:bg-transparent hover:text-gold/80"
                  onClick={() => markAllAsRead()}
                >
                  Mark all as read
                </Button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification: any) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="cursor-pointer px-4 py-3 border-b border-border last:border-0 align-items-start flex-col items-start gap-1 relative"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`font-medium text-sm ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                      {!notification.is_read && (
                        <span className="w-2 h-2 rounded-full bg-gold absolute right-2 top-1/2 -translate-y-1/2 opacity-50" />
                      )}
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

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
              {user ? (
                <>
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-semibold text-sm">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                    <p className="text-xs text-gold font-medium mt-1 capitalize">{user.role}</p>
                  </div>
                  <DropdownMenuItem onClick={handleSettingsClick}>
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
