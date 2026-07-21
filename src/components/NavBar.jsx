import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Bell, LogOut, User, Settings, ShieldAlert, Award } from "lucide-react";
import { api } from "../lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("kt_blog_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("kt_blog_notifications", JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        setIsLoggedIn(true);
        setUser(currentUser);
      } catch (e) {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    checkAuth();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("mock_current_user");
    localStorage.removeItem("current_user");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/");
  };

  const handleNotificationClick = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="flex items-center justify-between py-4 px-4 md:px-8 bg-background border-b border-muted relative z-40">
      <Link to="/" className="text-2xl font-bold text-foreground">
        Thomson P<span className="text-green-400">.</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        {isLoggedIn ? (
          <>
            {/* Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger className="relative p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer outline-hidden">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 bg-white dark:bg-zinc-900 border border-border p-2 rounded-md shadow-lg" align="end">
                <div className="flex items-center justify-between px-2 py-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] text-muted-foreground hover:text-foreground normal-case font-normal cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map(n => (
                    <DropdownMenuItem 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n.id)}
                      className={`p-2 text-sm rounded-md transition-colors ${
                        n.unread ? "bg-muted font-medium" : ""
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <p className="text-foreground leading-normal">{n.text}</p>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer outline-hidden">
                <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs uppercase">
                  {user?.username ? user.username.substring(0, 2) : (user?.email ? user.email.substring(0, 2) : "US")}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white dark:bg-zinc-900 border border-border p-2 rounded-md shadow-lg" align="end">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                  Logged in as <br />
                  <span className="font-bold text-foreground">{user?.username || user?.email}</span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                  <User className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile?tab=password")}>
                  <Settings className="w-4 h-4 mr-2" /> Reset password
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/admin")}>
                    <ShieldAlert className="w-4 h-4 mr-2" /> Admin panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex space-x-4">
            <Link
              to="/login"
              className="px-9 py-2 rounded-full text-foreground border border-foreground hover:border-muted-foreground hover:text-muted-foreground transition-colors font-semibold cursor-pointer"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-8 py-2 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity font-semibold cursor-pointer"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Hamburger Menu (Radix Dropdown Menu) */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 text-foreground cursor-pointer outline-hidden">
            <Menu className="w-6 h-6" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-white dark:bg-zinc-900 border border-border p-2 rounded-md shadow-lg" align="end">
            {isLoggedIn ? (
              <>
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                  Hello, <span className="font-bold text-foreground">{user?.username || user?.email}</span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                  <User className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile?tab=password")}>
                  <Settings className="w-4 h-4 mr-2" /> Reset password
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/admin")}>
                    <ShieldAlert className="w-4 h-4 mr-2" /> Admin panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/login")}>
                  Log in
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/register")}>
                  Sign up
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
