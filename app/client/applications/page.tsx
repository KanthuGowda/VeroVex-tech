"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ClientLogin = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Application = {
  id: string;
  status: string;
  appliedAt: string;

  project: {
    id: string;
    title: string;
    description: string;
    location: string | null;
    paymentAmount: number;
    skills: string | null;
    status: string;
    submission: {
      id: string;
      description: string | null;
      fileUrl: string | null;
      submittedAt: string;
    } | null;
  };

  student: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
};

export default function ClientApplicationsPage() {
  const router = useRouter();

  const [client, setClient] = useState<ClientLogin | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadApplications() {
    try {
      const savedClient = localStorage.getItem("verovex_client");

      if (!savedClient) {
        router.push("/client/login");
        return;
      }

      const parsedClient: ClientLogin = JSON.parse(savedClient);
      setClient(parsedClient);

      const response = await fetch("/api/client/applications", {
        headers: {
          "x-user-email": parsedClient.email,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load applications.");
      }

      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-6xl">
          <p>Loading applications...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white px-8 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">VeroVex</h1>
            <p className="text-sm text-gray-500">
              Client Applications
            </p>
          </div>

          <button
            onClick={() => router.push("/client/dashboard")}
            className="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-100"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Student Applications</h2>
          <p className="mt-2 text-gray-500">
            Review students who applied to your projects.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">
              No applications found.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => {
              const submitted =
                application.project.submission !== null ||
                application.project.status === "SUBMITTED";

              return (
                <div
                  key={application.id}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div>
                      <h3 className="text-xl font-bold">
                        {application.project.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Applied by{" "}
                        <span className="font-semibold text-gray-800">
                          {application.student.user.name}
                        </span>
                      </p>

                      <p className="text-sm text-gray-500">
                        {application.student.user.email}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          submitted
                            ? "bg-purple-100 text-purple-700"
                            : application.status === "ACCEPTED"
                              ? "bg-green-100 text-green-700"
                              : application.status === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {submitted
                          ? "SUBMITTED"
                          : application.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm font-semibold text-gray-500">
                        Project
                      </p>
                      <p className="mt-1">
                        {application.project.title}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm font-semibold text-gray-500">
                        Payment
                      </p>
                      <p className="mt-1 font-semibold">
                        ₹
                        {Number(
                          application.project.paymentAmount
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-semibold text-gray-500">
                      Project Description
                    </p>

                    <p className="mt-2 rounded-lg bg-gray-50 p-4">
                      {application.project.description}
                    </p>
                  </div>

                  {submitted && application.project.submission && (
                    <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50 p-6">
                      <h4 className="text-lg font-bold text-purple-900">
                        ✓ Student Submission
                      </h4>

                      <p className="mt-1 text-sm text-purple-700">
                        Submitted on{" "}
                        {new Date(
                          application.project.submission.submittedAt
                        ).toLocaleString()}
                      </p>

                      {application.project.submission.description && (
                        <div className="mt-5">
                          <p className="text-sm font-semibold text-gray-700">
                            Work Description
                          </p>

                          <p className="mt-2 rounded-lg bg-white p-4 text-gray-700">
                            {application.project.submission.description}
                          </p>
                        </div>
                      )}

                      {application.project.submission.fileUrl && (
                        <div className="mt-5">
                          <p className="text-sm font-semibold text-gray-700">
                            Submitted File
                          </p>

                          <a
                            href={
                              application.project.submission.fileUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                          >
                            View Submitted Work
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {!submitted && (
                    <div className="mt-6 rounded-lg bg-yellow-50 p-4 text-yellow-700">
                      Student has not submitted the completed work yet.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}