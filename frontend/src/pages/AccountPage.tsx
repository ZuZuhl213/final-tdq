import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { getMe, getAddresses, updateProfile } from "../services/authService";
import { listOrders } from "../services/orderService";
import useAuthStore from "../stores/authStore";
import useToastStore from "../stores/toastStore";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";

const tabs = [
  { key: "profile", label: "Profile", icon: "👤" },
  { key: "addresses", label: "Addresses", icon: "📍" },
  { key: "orders", label: "Orders", icon: "📦" },
  { key: "security", label: "Security", icon: "🔒" }
];

export default function AccountPage() {
  const [tab, setTab] = useState("profile");
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const toast = useToastStore((state) => state.push);
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMe
  });

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
    enabled: tab === "addresses"
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: listOrders,
    enabled: tab === "orders"
  });

  const { register: registerForm, handleSubmit: handleSubmitProfile } = useForm({
    defaultValues: profile
  });

  const onProfileSubmit = async (data: any) => {
    try {
      await updateProfile(data);
      setUser(data);
      toast("Profile updated successfully", "success");
      setIsEditing(false);
    } catch (err) {
      toast("Failed to update profile", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-[32px] p-8">
        <h1 className="text-3xl font-bold text-ink">My Account</h1>
        <p className="text-slate-600 mt-2">Manage your profile, addresses, orders, and security settings</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-Border pb-4">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tab === item.key
                ? "bg-Primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <div className="glass-panel rounded-[32px] p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-ink">Profile Information</h2>
            <Button 
              variant={isEditing ? "outline" : "primary"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          {profileLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : profile ? (
            <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Username</label>
                  <input
                    {...registerForm("username")}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-Border rounded-lg bg-white text-ink disabled:bg-slate-50 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Email</label>
                  <input
                    {...registerForm("email")}
                    type="email"
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-Border rounded-lg bg-white text-ink disabled:bg-slate-50 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">Role</label>
                <input
                  type="text"
                  value={profile.role || "user"}
                  disabled
                  className="w-full px-4 py-2 border border-Border rounded-lg bg-slate-50 text-slate-600"
                />
                <p className="text-xs text-slate-500 mt-1">Role is read-only and managed by administrators</p>
              </div>

              {isEditing && (
                <Button variant="primary" type="submit" className="w-full">
                  Save Changes
                </Button>
              )}
            </form>
          ) : null}
        </div>
      )}

      {/* Addresses Tab */}
      {tab === "addresses" && (
        <div className="glass-panel rounded-[32px] p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-ink">Saved Addresses</h2>
            <Button variant="primary">Add Address</Button>
          </div>

          {addressesLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : addresses && addresses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {addresses.map((address: any) => (
                <div key={address.id} className="border border-Border rounded-lg p-4">
                  <p className="font-semibold text-ink">{address.name}</p>
                  <p className="text-sm text-slate-600 mt-2">{address.line1}</p>
                  {address.line2 && <p className="text-sm text-slate-600">{address.line2}</p>}
                  <p className="text-sm text-slate-600">{address.city}, {address.state} {address.postal_code}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">No saved addresses</p>
              <Button variant="primary">Add Your First Address</Button>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <div className="glass-panel rounded-[32px] p-8">
          <h2 className="text-2xl font-bold text-ink mb-6">Order History</h2>

          {ordersLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order: any) => (
                <div key={order.id} className="border border-Border rounded-lg p-4 hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-ink">Order #{order.id}</p>
                      <p className="text-sm text-slate-600 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-ink">${(order.total_amount || 0).toFixed(2)}</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${
                        order.status === "completed"
                          ? "bg-Success bg-opacity-10 text-Success"
                          : "bg-blue-50 text-Primary"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-3">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">No orders yet</p>
              <Button variant="primary" onClick={() => window.location.href = "/products"}>
                Start Shopping
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {tab === "security" && (
        <div className="glass-panel rounded-[32px] p-8">
          <h2 className="text-2xl font-bold text-ink mb-6">Security & Privacy</h2>

          <div className="space-y-4">
            <div className="p-4 border border-Border rounded-lg">
              <p className="font-semibold text-ink mb-2">Change Password</p>
              <p className="text-sm text-slate-600 mb-4">Update your password to keep your account secure</p>
              <Button variant="outline">Change Password</Button>
            </div>

            <div className="p-4 border border-Border rounded-lg">
              <p className="font-semibold text-ink mb-2">Two-Factor Authentication</p>
              <p className="text-sm text-slate-600 mb-4">Add an extra layer of security to your account</p>
              <Button variant="outline">Enable 2FA</Button>
            </div>

            <div className="p-4 border border-Border rounded-lg">
              <p className="font-semibold text-ink mb-2">Delete Account</p>
              <p className="text-sm text-slate-600 mb-4">Permanently delete your account and all associated data</p>
              <Button variant="ghost">Delete Account</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
