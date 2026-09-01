
"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Settings
          </h1>

          <p className="mt-2 text-gray-600">
            Manage VeroVex administration settings.
          </p>
        </div>

        <div className="space-y-6">

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-gray-900">
              Platform Settings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Configure basic platform behaviour.
            </p>

            <div className="mt-6 flex items-center justify-between border-b pb-5">
              <div>
                <p className="font-medium text-gray-900">
                  Maintenance Mode
                </p>

                <p className="text-sm text-gray-500">
                  Temporarily disable access to the platform.
                </p>
              </div>

              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`rounded-lg px-4 py-2 font-medium ${
                  maintenanceMode
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {maintenanceMode ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Admin Notifications
                </p>

                <p className="text-sm text-gray-500">
                  Receive notifications about platform activity.
                </p>
              </div>

              <button
                onClick={() => setNotifications(!notifications)}
                className={`rounded-lg px-4 py-2 font-medium ${
                  notifications
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {notifications ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-gray-900">
              Payment Configuration
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current VeroVex platform payment distribution.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-5">
                <p className="text-sm text-gray-500">
                  Platform Fee
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  40%
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-5">
                <p className="text-sm text-gray-500">
                  Student Payment
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  60%
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-gray-900">
              Administrator
            </h2>

            <p className="mt-2 text-gray-600">
              VeroVex Administration Portal
            </p>

            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Access Level
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                Administrator
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

