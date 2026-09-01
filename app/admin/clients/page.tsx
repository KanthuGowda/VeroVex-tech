"use client";

import { useEffect, useState } from "react";

type Job = {
  id: string;
  title: string;
  location: string | null;
  createdAt: string;
};

type Client = {
  id: string;
  companyName: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  jobs: Job[];
};

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClients() {
      try {
        const response = await fetch("/api/admin/clients");

        if (!response.ok) {
          throw new Error("Failed to load clients");
        }

        const data = await response.json();

        setClients(data.clients);
      } catch (error) {
        console.error(error);
        setError("Unable to load clients.");
      } finally {
        setLoading(false);
      }
    }

    loadClients();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold">
            VeroVex Admin
          </h1>

          <p className="text-sm text-gray-500">
            Client Management
          </p>
        </div>

        <a
          href="/admin/dashboard"
          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-100"
        >
          ← Dashboard
        </a>
      </header>

      {/* Content */}
      <section className="p-8">

        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Clients
          </h2>

          <p className="mt-2 text-gray-500">
            Manage companies registered on VeroVex.
          </p>
        </div>

        {/* Client count */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Clients
          </p>

          <p className="mt-1 text-3xl font-bold">
            {clients.length}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            Loading clients...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl bg-white p-8 text-center text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && clients.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">

            <h3 className="text-xl font-bold">
              No clients yet
            </h3>

            <p className="mt-2 text-gray-500">
              No companies have registered on VeroVex yet.
            </p>

          </div>
        )}

        {/* Clients table */}
        {!loading && !error && clients.length > 0 && (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b bg-gray-50">
                  <tr>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Company
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Jobs
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Joined
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >

                      {/* Company */}
                      <td className="px-6 py-5">

                        <div className="font-semibold">
                          {client.companyName}
                        </div>

                        <div className="text-sm text-gray-500">
                          {client.user.name}
                        </div>

                      </td>

                      {/* Contact */}
                      <td className="px-6 py-5 text-sm">
                        {client.user.email}
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-5 text-sm">
                        {client.phone || "Not provided"}
                      </td>

                      {/* Jobs */}
                      <td className="px-6 py-5 text-sm">
                        {client.jobs.length}
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {new Date(
                          client.user.createdAt
                        ).toLocaleDateString()}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5">

                        <a
                          href={`/admin/clients/${client.id}`}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          View
                        </a>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </section>

    </main>
  );
}
