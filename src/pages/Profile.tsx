import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    ""
  );

  const provider = user?.app_metadata?.provider || "email";

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "—";

  // ✅ SAVE PROFILE
  const handleSaveProfile = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: displayName },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated ✅");
    }
  };

  // ✅ LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully ✅");
    navigate("/");
  };

  // ✅ DELETE
  const handleDeleteAccount = async () => {
    if (!user) return;

    await supabase.from("analyses").delete().eq("user_id", user.id);
    await supabase.auth.signOut();

    toast.success("Account deleted");
    navigate("/");
  };

  // ✅ LOADING FIX
  if (!user) {
    return <div className="text-center mt-10">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* TITLE */}
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-500">Manage your account settings</p>
      </div>

      {/* HEADER CARD */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        
        {/* ORANGE TOP */}
        <div className="h-20 bg-gradient-to-r from-orange-500 to-orange-400" />

        <div className="p-6 -mt-10 flex items-center gap-4">
          
          {/* AVATAR */}
          <div className="h-20 w-20 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow">
            {displayName?.charAt(0).toUpperCase()}
          </div>

          {/* USER INFO */}
          <div>
            <h2 className="text-xl font-semibold">{displayName}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>

          {/* BADGE */}
          <div className="ml-auto">
            <span className="bg-black text-white text-xs px-3 py-1 rounded-full">
              {provider === "google" ? "Google Account" : "Email Account"}
            </span>
          </div>
        </div>
      </div>

      {/* PERSONAL INFO */}
      <div className="bg-white p-6 rounded-xl shadow border space-y-4">
        <h3 className="font-semibold text-lg">Personal Information</h3>
        <p className="text-sm text-gray-500">Update your profile details</p>

        <div className="space-y-2">
          <label className="text-sm font-medium">Display Name</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            className="w-full border rounded-md px-3 py-2 bg-gray-100"
            value={user.email}
            disabled
          />
          <p className="text-xs text-gray-400">
            Email cannot be changed here
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          className="bg-orange-500 text-white px-5 py-2 rounded-md font-medium hover:bg-orange-600"
        >
          Save Changes
        </button>
      </div>

      {/* ACCOUNT DETAILS */}
      <div className="bg-white p-6 rounded-xl shadow border space-y-4">
        <h3 className="font-semibold text-lg">Account Details</h3>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Email</span>
          <span>{user.email}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Provider</span>
          <span className="capitalize">{provider}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Member Since</span>
          <span>{memberSince}</span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="bg-white p-6 rounded-xl shadow border flex gap-4">
        <button
          onClick={handleLogout}
          className="border px-4 py-2 rounded-md hover:bg-gray-100"
        >
          Sign Out
        </button>

        <button
          onClick={handleDeleteAccount}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Delete Account
        </button>
      </div>

    </div>
  );
}