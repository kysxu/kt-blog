import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { toast } from "sonner";
import { User, Lock, Save, Camera, Check } from "lucide-react";

const presetAvatars = [
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=150&auto=format&fit=crop&q=60"
];

export default function UserProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "password" ? "password" : "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Password reset states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
        setUsername(currentUser.username || "");
        setSelectedAvatar(currentUser.avatar || presetAvatars[0]);
      } catch (err) {
        toast.error("You must be logged in to view this page.");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, [navigate]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "password") {
      setActiveTab("password");
    } else {
      setActiveTab("profile");
    }
  }, [searchParams]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username cannot be empty.");
      return;
    }

    try {
      const updated = await api.updateProfile({ username, avatar: selectedAvatar });
      setUser(updated);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    }
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    
    // Show confirm dialog
    setShowResetConfirm(true);
  };

  const handleConfirmResetPassword = async () => {
    setShowResetConfirm(false);
    try {
      await api.resetPassword({ oldPassword, newPassword });
      toast.success("Password reset successful!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      toast.error(err.message || "Failed to reset password.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40 text-lg font-medium text-muted-foreground animate-pulse">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-6 gap-2">
          <h2 className="text-xl font-bold text-foreground mb-4 px-3 hidden md:block">Settings</h2>
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left cursor-pointer ${
              activeTab === "profile"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" /> Profile Details
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left cursor-pointer ${
              activeTab === "password"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Lock className="w-4 h-4" /> Reset Password
          </button>
        </aside>

        {/* Tab Panel */}
        <main className="flex-grow max-w-xl">
          {activeTab === "profile" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">Profile Details</h3>
                <p className="text-sm text-muted-foreground mt-1">Update your display information and profile avatar.</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
                {/* Avatar Selector */}
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-muted-foreground" /> Profile Picture
                  </span>
                  <div className="flex flex-wrap gap-4 items-center">
                    <img
                      src={selectedAvatar}
                      alt="Current avatar"
                      className="w-16 h-16 rounded-full border border-border object-cover"
                    />
                    <div className="flex gap-2.5">
                      {presetAvatars.map((av, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedAvatar(av)}
                          className={`relative w-10 h-10 rounded-full overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${
                            selectedAvatar === av ? "border-foreground" : "border-transparent"
                          }`}
                        >
                          <img src={av} alt={`Avatar option ${index}`} className="w-full h-full object-cover" />
                          {selectedAvatar === av && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Username Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="p-3 border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-foreground bg-white dark:bg-zinc-900 w-full text-sm"
                    required
                  />
                </div>

                {/* Email (Disabled) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">Email address</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="p-3 border border-border rounded-md text-muted-foreground bg-muted w-full text-sm cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">Contact your administrator to change your email.</p>
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-foreground text-background font-semibold rounded-md hover:opacity-90 transition-opacity cursor-pointer w-fit self-start"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </form>
            </div>
          )}

          {activeTab === "password" && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">Reset Password</h3>
                <p className="text-sm text-muted-foreground mt-1">Secure your account by updating your password.</p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="p-3 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground bg-white dark:bg-zinc-900 w-full text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="p-3 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground bg-white dark:bg-zinc-900 w-full text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="p-3 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground bg-white dark:bg-zinc-900 w-full text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-foreground text-background font-semibold rounded-md hover:opacity-90 transition-opacity cursor-pointer w-fit self-start mt-2"
                >
                  Reset Password
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Dialog Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-border rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="text-lg font-bold text-foreground mb-2">Confirm Password Reset</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to reset your password? You will need to use this new password the next time you log in.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-border rounded-md text-sm text-foreground hover:bg-muted font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResetPassword}
                className="px-4 py-2 bg-foreground text-background rounded-md text-sm hover:opacity-90 font-semibold cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
