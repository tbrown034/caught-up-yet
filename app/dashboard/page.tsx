"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Calendar, Plus } from "lucide-react";
import type { Room, GameData } from "@/lib/database.types";
import { formatShareCode } from "@/lib/share-code";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Check auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email || null);

      // Fetch rooms
      try {
        const response = await fetch("/api/rooms");
        if (response.ok) {
          const data = await response.json();
          setRooms(data.rooms || []);
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }

      setIsLoading(false);
    }

    loadData();
  }, []);

  const handleSignOut = async () => {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">Welcome, {userEmail}</p>
            </div>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="secondary">
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => router.push("/games")}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition-colors flex items-center gap-4"
          >
            <Plus className="w-8 h-8" />
            <div className="text-left">
              <p className="font-semibold text-lg">Create Watch Party</p>
              <p className="text-sm text-blue-100">Browse games and start a party</p>
            </div>
          </button>

          <button
            onClick={() => router.push("/rooms/join")}
            className="bg-white hover:bg-gray-50 border-2 border-blue-600 text-blue-600 p-6 rounded-lg transition-colors flex items-center gap-4"
          >
            <Users className="w-8 h-8" />
            <div className="text-left">
              <p className="font-semibold text-lg">Join Watch Party</p>
              <p className="text-sm text-gray-600">Enter a share code</p>
            </div>
          </button>
        </div>

        {/* Active Rooms */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Your Watch Parties
          </h2>

          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No watch parties yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Create a watch party or join one with a share code
              </p>
              <Button
                onClick={() => router.push("/games")}
                variant="primary"
              >
                Browse Games
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {rooms.map((room) => {
                const gameData = room.game_data as GameData;
                const isExpired = new Date(room.expires_at) < new Date();

                return (
                  <div
                    key={room.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      isExpired
                        ? "bg-gray-50 border-gray-200"
                        : "bg-white border-gray-300 hover:border-blue-500 cursor-pointer"
                    }`}
                    onClick={() =>
                      !isExpired && router.push(`/rooms/${room.id}`)
                    }
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase">
                            {room.sport}
                          </span>
                          {isExpired && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-semibold rounded">
                              EXPIRED
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          {gameData?.awayTeam} @ {gameData?.homeTeam}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(room.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Share Code</p>
                        <p className="font-mono font-semibold text-blue-600">
                          {formatShareCode(room.share_code)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
