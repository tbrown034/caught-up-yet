import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Users, Plus, Trophy, UserPlus } from "lucide-react";
import type { Room } from "@/lib/database.types";
import Button from "@/components/ui/Button";
import Link from "next/link";
import RoomCard from "@/components/dashboard/RoomCard";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Server-side auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Don't allow anonymous users
  if (user.is_anonymous) {
    redirect("/login");
  }

  // Fetch user's rooms
  const { data: rooms } = await supabase
    .from("room_members")
    .select("room_id")
    .eq("user_id", user.id);

  const roomIds = rooms?.map((r) => r.room_id) || [];

  let userRooms: Room[] = [];
  if (roomIds.length > 0) {
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .in("id", roomIds)
      .order("created_at", { ascending: false });

    userRooms = data || [];
  }

  // Calculate stats
  const roomsCreated = userRooms.filter((room) => room.created_by === user.id).length;
  const roomsJoined = userRooms.filter((room) => room.created_by !== user.id).length;

  const userEmail = user.email || "User";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome, {userEmail}</p>
            </div>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="secondary">
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{roomsCreated}</p>
                <p className="text-sm text-gray-600">Parties Created</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{roomsJoined}</p>
                <p className="text-sm text-gray-600">Parties Joined</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{userRooms.length}</p>
                <p className="text-sm text-gray-600">Total Parties</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link
            href="/games"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition-colors flex items-center gap-4"
          >
            <Plus className="w-8 h-8" />
            <div className="text-left">
              <p className="font-semibold text-lg">Create Watch Party</p>
              <p className="text-sm text-blue-100">Browse games and start a party</p>
            </div>
          </Link>

          <Link
            href="/rooms/join"
            className="bg-white hover:bg-gray-50 border-2 border-blue-600 text-blue-600 p-6 rounded-lg transition-colors flex items-center gap-4"
          >
            <Users className="w-8 h-8" />
            <div className="text-left">
              <p className="font-semibold text-lg">Join Watch Party</p>
              <p className="text-sm text-gray-600">Enter a share code</p>
            </div>
          </Link>
        </div>

        {/* Active Rooms */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Watch Parties</h2>

          {userRooms.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No watch parties yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Create a watch party or join one with a share code
              </p>
              <Link href="/games">
                <Button variant="primary">Browse Games</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isCreator={room.created_by === user.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
