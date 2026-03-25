import { Settings, ShieldCheck, Globe, Bell, Database, Key } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

/* ── Platform settings page ───────────────────────────────── */
export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated">
          <Settings className="h-5 w-5 text-muted" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
          <p className="text-muted">Configure platform-wide settings</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-neon" />
            <h2 className="font-semibold text-white">General</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Platform Name</label>
              <input
                type="text"
                defaultValue="LearnMyShow"
                className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white px-3 py-2.5 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Support Email</label>
              <input
                type="email"
                defaultValue="support@learnmyshow.com"
                className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated text-white px-3 py-2.5 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Default Currency</label>
              <select className="mt-1 w-full rounded-lg border border-surface-border bg-surface-elevated px-3 py-2.5 text-sm text-white focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon">
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="INR">INR — Indian Rupee</option>
                <option value="GBP">GBP — British Pound</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Maintenance Mode</p>
                <p className="text-xs text-muted">Disable public access temporarily</p>
              </div>
              <Badge variant="success">OFF</Badge>
            </div>
            <Button size="sm">Save Changes</Button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-red-400" />
            <h2 className="font-semibold text-white">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Two-Factor Authentication</p>
                <p className="text-xs text-muted">Require 2FA for admin accounts</p>
              </div>
              <Badge variant="warning">Optional</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Session Timeout</p>
                <p className="text-xs text-muted">Auto-logout after inactivity</p>
              </div>
              <span className="text-sm text-gray-300">30 minutes</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">IP Whitelist</p>
                <p className="text-xs text-muted">Restrict admin panel access by IP</p>
              </div>
              <Badge variant="default">Disabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Audit Logging</p>
                <p className="text-xs text-muted">Log all admin actions</p>
              </div>
              <Badge variant="success">Enabled</Badge>
            </div>
            <Button size="sm" variant="outline">Configure Security</Button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-yellow-400" />
            <h2 className="font-semibold text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">New User Registration</p>
                <p className="text-xs text-muted">Email admin on new signups</p>
              </div>
              <Badge variant="success">ON</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Payment Alerts</p>
                <p className="text-xs text-muted">Notify on failed or refunded payments</p>
              </div>
              <Badge variant="success">ON</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Event Status Changes</p>
                <p className="text-xs text-muted">Notify when events are published/cancelled</p>
              </div>
              <Badge variant="default">OFF</Badge>
            </div>
            <Button size="sm" variant="outline">Update Notifications</Button>
          </div>
        </div>

        {/* Database & API Keys */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-neon" />
            <h2 className="font-semibold text-white">Database &amp; API</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-300">Database Status</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="text-sm text-muted">Connected — PostgreSQL (Supabase)</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">Supabase Project</p>
              <p className="text-xs text-muted font-mono mt-1">learnmyshow.supabase.co</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted" />
                <p className="text-sm font-medium text-gray-300">API Keys</p>
              </div>
              <Button size="sm" variant="ghost">Rotate Keys</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Mapbox Token</p>
                <p className="text-xs text-muted font-mono">pk.eyJ1I•••••••••</p>
              </div>
              <Button size="sm" variant="ghost">Update</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
