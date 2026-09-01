
"use client";

import { useEffect, useState } from "react";

type Stats = {
  students: number;
  clients: number;
  projects: number;
  applications: number;
  submissions: number;
  payments: number;
};

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats>({
    students: 0,
    clients: 0,
    projects: 0,
    applications: 0,
    submissions: 0,
    payments: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch("/api/admin/stats");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load statistics.");
        }

        setStats({
          students: data.totalStudents ?? 0,
          clients: data.totalClients ?? 0,
          projects: data.activeProjects ?? 0,
          applications: data.totalApplications ?? 0,
          submissions: data.totalSubmissions ?? 0,
          payments: data.totalPayments ?? 0,
        });
      } catch (error) {
        console.error("Analytics error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const cards = [
    {
      title: "Total Students",
      value: stats.students,
    },
    {
      title: "Total Clients",
      value: stats.clients,
    },
    {
      title: "Total Projects",
      value: stats.projects,
    },
    {
      title: "Applications",
      value: stats.applications,
    },
    {
      title: "Submissions",
      value: stats.submissions,
    },
    {
      title: "Payments",
      value: stats.payments,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics
          </h1>

          <p className="mt-2 text-gray-600">
            Overview of VeroVex platform activity.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-6 shadow">
            Loading analytics...
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl bg-white p-6 shadow"
                >
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl bg-white p-6 shadow">
              <h2 className="text-xl font-bold text-gray-900">
                Platform Overview
              </h2>

              <div className="mt-6 space-y-4">

                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-600">
                    Students registered
                  </span>

                  <span className="font-semibold">
                    {stats.students}
                  </span>
                </div>

                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-600">
                    Clients registered
                  </span>

                  <span className="font-semibold">
                    {stats.clients}
                  </span>
                </div>

                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-600">
                    Projects created
                  </span>

                  <span className="font-semibold">
                    {stats.projects}
                  </span>
                </div>

                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-600">
                    Student applications
                  </span>

                  <span className="font-semibold">
                    {stats.applications}
                  </span>
                </div>

                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-600">
                    Work submissions
                  </span>

                  <span className="font-semibold">
                    {stats.submissions}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Payment records
                  </span>

                  <span className="font-semibold">
                    {stats.payments}
                  </span>
                </div>

              </div>
            </div>
          </>
        )}

      </div>
    </main>
  );
}

