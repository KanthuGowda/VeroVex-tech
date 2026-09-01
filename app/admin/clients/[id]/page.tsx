"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Client = {
  id: string;
  companyName?: string | null;
  phone?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  projects?: {
    id: string;
    title: string;
    description: string;
    paymentAmount: number;
    status: string;
    createdAt: string;
  }[];
};

export default function AdminClientDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClient() {
      try {
        const response = await fetch(`/api/admin/clients/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load client.");
        }

        setClient(data.client);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load client."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadClient();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <p className="text-gray-600">Loading client...</p>
      </main>
    );
  }

  if (error || !client) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <button
          onClick={() => router.push("/admin/clients")}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Clients
        </button>

        <div className="rounded-xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-red-600">
            Unable to load client
          </h1>

          <p className="mt-2 text-gray-600">
            {error || "Client not found."}
          </p>
        </div>
      </main>
    );
  }

  const projects = client.projects ?? [];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.push("/admin/clients")}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Clients
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Client Profile
          </h1>

          <p className="mt-1 text-gray-600">
            View client account and project information.
          </p>
        </div>

        {/* Client Information */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-semibold">
            Personal Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-semibold">
                {client.user?.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">
                {client.user?.email || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="font-semibold">
                {client.companyName || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-semibold">
                {client.phone || "—"}
              </p>
            </div>
          </div>
        </section>

        {/* Account Information */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-semibold">
            Account Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="break-all font-mono text-sm">
                {client.user?.id || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Client ID</p>
              <p className="break-all font-mono text-sm">
                {client.id}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-semibold">
                {client.user?.role || "CLIENT"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Joined</p>
              <p className="font-semibold">
                {client.user?.createdAt
                  ? new Date(client.user.createdAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section className="rounded-xl bg-white p-6 shadow">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Projects
            </h2>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold">
              {projects.length}
            </span>
          </div>

          {projects.length === 0 ? (
            <p className="text-gray-500">
              This client has not created any projects yet.
            </p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-lg border p-5"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {project.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        {project.description}
                      </p>
                    </div>

                    <span className="h-fit rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold">
                      {project.status}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">
                        Payment:
                      </span>{" "}
                      <span className="font-semibold">
                        ₹{project.paymentAmount}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500">
                        Created:
                      </span>{" "}
                      <span className="font-semibold">
                        {new Date(
                          project.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}