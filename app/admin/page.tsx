"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Database,
  Server,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  Home,
  ExternalLink,
  TrendingUp,
  Zap,
  HardDrive,
  Globe,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

type AdminStats = {
  database: {
    rooms: { count: number; active: number };
    room_members: { count: number; unique_users: number };
    messages: { count: number };
  };
  system: {
    nodeVersion: string;
    platform: string;
    uptime: number;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    env: string;
    deploymentUrl: string;
  };
  supabase: {
    url: string;
    hasAnonKey: boolean;
    projectId: string | null;
  };
  recentRooms: any[];
  timestamp: string;
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }
      loadStats();
    }
    checkAuth();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  async function loadStats() {
    try {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      const data = await response.json();
      setStats(data.stats);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Server className="w-8 h-8 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                System monitoring and analytics
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadStats} variant="secondary" size="sm">
                Refresh
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="secondary"
                size="sm"
              >
                <Home className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span>Error: {error}</span>
          </div>
        )}

        {stats && (
          <>
            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                label="System Status"
                value="Online"
                color="green"
              />
              <StatCard
                icon={<Clock className="w-6 h-6 text-blue-600" />}
                label="Uptime"
                value={formatUptime(stats.system.uptime)}
                color="blue"
              />
              <StatCard
                icon={<Users className="w-6 h-6 text-purple-600" />}
                label="Total Users"
                value={stats.database.room_members.unique_users.toString()}
                color="purple"
              />
              <StatCard
                icon={<Home className="w-6 h-6 text-orange-600" />}
                label="Active Rooms"
                value={`${stats.database.rooms.active}/${stats.database.rooms.count}`}
                color="orange"
              />
            </div>

            {/* Deployment Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Deployment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Environment" value={stats.system.env} />
                <InfoRow
                  label="Deployment URL"
                  value={stats.system.deploymentUrl}
                  link={`https://${stats.system.deploymentUrl}`}
                />
                <InfoRow label="Node Version" value={stats.system.nodeVersion} />
                <InfoRow label="Platform" value={stats.system.platform} />
                <InfoRow
                  label="Last Git Update"
                  value="Nov 15, 2025 18:57:44"
                />
                <InfoRow
                  label="Latest Commit"
                  value="Merge pull request #2"
                />
              </div>
            </div>

            {/* Supabase Dashboard */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                Supabase Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  label="Supabase URL"
                  value={stats.supabase.url}
                  link={stats.supabase.url}
                />
                <InfoRow
                  label="Project ID"
                  value={stats.supabase.projectId || "N/A"}
                />
                <InfoRow
                  label="Anon Key Configured"
                  value={stats.supabase.hasAnonKey ? "Yes" : "No"}
                  status={stats.supabase.hasAnonKey ? "success" : "error"}
                />
                <InfoRow
                  label="Dashboard Link"
                  value="Open Supabase Dashboard"
                  link={`https://supabase.com/dashboard/project/${stats.supabase.projectId}`}
                />
              </div>
            </div>

            {/* Database Analytics */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Database Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <MetricCard
                  label="Total Rooms"
                  value={stats.database.rooms.count}
                  subtitle={`${stats.database.rooms.active} active`}
                  icon={<Home className="w-5 h-5" />}
                />
                <MetricCard
                  label="Total Users"
                  value={stats.database.room_members.unique_users}
                  subtitle={`${stats.database.room_members.count} memberships`}
                  icon={<Users className="w-5 h-5" />}
                />
                <MetricCard
                  label="Total Messages"
                  value={stats.database.messages.count}
                  subtitle="All time"
                  icon={<MessageSquare className="w-5 h-5" />}
                />
              </div>

              <h3 className="font-semibold text-gray-900 mb-3">
                Database Tables
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-3 font-semibold">
                        Table Name
                      </th>
                      <th className="text-left p-3 font-semibold">
                        Row Count
                      </th>
                      <th className="text-left p-3 font-semibold">Status</th>
                      <th className="text-left p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 font-mono text-xs">rooms</td>
                      <td className="p-3">{stats.database.rooms.count}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Active
                        </span>
                      </td>
                      <td className="p-3">
                        <a
                          href={`https://supabase.com/dashboard/project/${stats.supabase.projectId}/editor/rooms`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          View in Supabase
                        </a>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 font-mono text-xs">room_members</td>
                      <td className="p-3">
                        {stats.database.room_members.count}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Active
                        </span>
                      </td>
                      <td className="p-3">
                        <a
                          href={`https://supabase.com/dashboard/project/${stats.supabase.projectId}/editor/room_members`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          View in Supabase
                        </a>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-3 font-mono text-xs">messages</td>
                      <td className="p-3">{stats.database.messages.count}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Active
                        </span>
                      </td>
                      <td className="p-3">
                        <a
                          href={`https://supabase.com/dashboard/project/${stats.supabase.projectId}/editor/messages`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          View in Supabase
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Performance Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  label="Memory (RSS)"
                  value={formatBytes(stats.system.memoryUsage.rss)}
                  icon={<HardDrive className="w-5 h-5" />}
                />
                <MetricCard
                  label="Heap Total"
                  value={formatBytes(stats.system.memoryUsage.heapTotal)}
                  icon={<HardDrive className="w-5 h-5" />}
                />
                <MetricCard
                  label="Heap Used"
                  value={formatBytes(stats.system.memoryUsage.heapUsed)}
                  icon={<HardDrive className="w-5 h-5" />}
                />
                <MetricCard
                  label="External"
                  value={formatBytes(stats.system.memoryUsage.external)}
                  icon={<HardDrive className="w-5 h-5" />}
                />
              </div>
            </div>

            {/* AI/Models Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                AI Models & External Services
              </h2>
              <div className="space-y-3">
                <InfoRow
                  label="ESPN Sports API"
                  value="Active (Public API)"
                  status="success"
                />
                <InfoRow
                  label="AI Models"
                  value="No AI models currently integrated"
                  status="neutral"
                />
                <p className="text-sm text-gray-500 mt-4">
                  No AI/ML models are currently configured. Add API keys to
                  .env.local to enable AI features.
                </p>
              </div>
            </div>

            {/* Error Monitoring */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Error Monitoring
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <p className="text-sm text-gray-600 mb-2">
                  Error tracking not yet configured
                </p>
                <p className="text-xs text-gray-500">
                  Consider integrating: Sentry, LogRocket, or Vercel Analytics
                  for production error monitoring
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colorClasses = {
    green: "bg-green-50 border-green-200",
    blue: "bg-blue-50 border-blue-200",
    purple: "bg-purple-50 border-purple-200",
    orange: "bg-orange-50 border-orange-200",
  }[color];

  return (
    <div className={`${colorClasses} border rounded-lg p-4`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  link,
  status,
}: {
  label: string;
  value: string;
  link?: string;
  status?: "success" | "error" | "neutral";
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        {status === "success" && (
          <CheckCircle className="w-4 h-4 text-green-600" />
        )}
        {status === "error" && (
          <AlertCircle className="w-4 h-4 text-red-600" />
        )}
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            {value}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-sm text-gray-900">{value}</span>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
  icon,
}: {
  label: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-gray-600">{label}</span>
        <div className="text-gray-400">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
