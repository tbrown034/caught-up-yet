"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, Users, Trash2, Calendar, MessageCircle } from "lucide-react";
import type { Room, GameData } from "@/lib/database.types";
import { formatShareCode } from "@/lib/share-code";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_anonymous: boolean;
  roomsCreated: number;
  roomsJoined: number;
}

interface AdminRoom extends Room {
  memberCount: number;
  messageCount: number;
  creatorEmail: string;
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "rooms">("users");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    type: "user" | "room";
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check auth and admin status
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || user.is_anonymous) {
        router.push("/login");
        return;
      }

      // Check if user is admin
      const adminEmails = ["tbrown034@gmail.com", "trevorbrown.web@gmail.com"];
      if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
        router.push("/dashboard");
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    }

    checkAuth();
  }, [router, supabase.auth]);

  // Fetch users
  useEffect(() => {
    if (!isAuthorized) return;

    async function fetchUsers() {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    }

    fetchUsers();
  }, [isAuthorized]);

  // Fetch rooms
  useEffect(() => {
    if (!isAuthorized) return;

    async function fetchRooms() {
      const response = await fetch("/api/admin/rooms");
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms);
      }
    }

    fetchRooms();
  }, [isAuthorized]);

  const handleDeleteUser = async () => {
    if (!showDeleteConfirm || showDeleteConfirm.type !== "user") return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${showDeleteConfirm.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Refresh user list
      setUsers(users.filter((u) => u.id !== showDeleteConfirm.id));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!showDeleteConfirm || showDeleteConfirm.type !== "room") return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/rooms/${showDeleteConfirm.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete room");
      }

      // Refresh room list
      setRooms(rooms.filter((r) => r.id !== showDeleteConfirm.id));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting room:", err);
      alert("Failed to delete room. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Manage users and watch parties
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                Users ({users.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("rooms")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "rooms"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Watch Parties ({rooms.length})
              </div>
            </button>
          </div>

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                        Created
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                        Last Sign In
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">
                        Rooms Created
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">
                        Rooms Joined
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.email}
                            </p>
                            {user.is_anonymous && (
                              <span className="text-xs text-gray-500">
                                (Guest)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {user.last_sign_in_at
                            ? new Date(user.last_sign_in_at).toLocaleDateString()
                            : "Never"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-center">
                          {user.roomsCreated}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-center">
                          {user.roomsJoined}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() =>
                              setShowDeleteConfirm({
                                type: "user",
                                id: user.id,
                                name: user.email,
                              })
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No users found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rooms Tab */}
          {activeTab === "rooms" && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                        Name / Game
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                        Sport
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                        Creator
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                        Share Code
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">
                        Members
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">
                        Messages
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                        Created
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => {
                      const gameData = room.game_data as GameData;
                      const isExpired = new Date(room.expires_at) < new Date();

                      return (
                        <tr
                          key={room.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {room.name ||
                                  `${gameData?.awayTeam} @ ${gameData?.homeTeam}`}
                              </p>
                              {room.name && (
                                <p className="text-xs text-gray-500">
                                  {gameData?.awayTeam} @ {gameData?.homeTeam}
                                </p>
                              )}
                              {isExpired && (
                                <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-semibold rounded mt-1">
                                  EXPIRED
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs font-semibold text-gray-500 uppercase">
                              {room.sport}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {room.creatorEmail}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm font-semibold text-blue-600">
                              {formatShareCode(room.share_code)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 text-center">
                            {room.memberCount}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900 text-center">
                            {room.messageCount}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(room.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() =>
                                setShowDeleteConfirm({
                                  type: "room",
                                  id: room.id,
                                  name:
                                    room.name ||
                                    `${gameData?.awayTeam} @ ${gameData?.homeTeam}`,
                                })
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete room"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {rooms.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No rooms found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete {showDeleteConfirm.type === "user" ? "User" : "Room"}?
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              {showDeleteConfirm.type === "user" ? (
                <>
                  This will permanently delete the user{" "}
                  <strong>{showDeleteConfirm.name}</strong> and all their data.
                </>
              ) : (
                <>
                  This will permanently delete the room{" "}
                  <strong>{showDeleteConfirm.name}</strong> and all associated
                  messages.
                </>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={
                  showDeleteConfirm.type === "user"
                    ? handleDeleteUser
                    : handleDeleteRoom
                }
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 disabled:border-gray-200 disabled:text-gray-400 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
