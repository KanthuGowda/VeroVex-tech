
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
    paymentAmount: number | string;
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

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState("");

  async function loadApplications() {
    try {
      setLoading(true);
      setError("");

      const savedClient = localStorage.getItem("verovex_client");

      if (!savedClient) {
        router.push("/client/login");
        return;
      }

      const parsedClient: ClientLogin = JSON.parse(savedClient);

      const response = await fetch("/api/client/applications", {
        headers: {
          "x-user-email": parsedClient.email,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load applications."
        );
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

  async function reviewSubmission(
    applicationId: string,
    action: "APPROVE" | "CHANGES"
  ) {
    try {
      setProcessingId(applicationId);
      setError("");
      setMessage("");

      const savedClient = localStorage.getItem("verovex_client");

      if (!savedClient) {
        router.push("/client/login");
        return;
      }

      const parsedClient: ClientLogin = JSON.parse(savedClient);

      const response = await fetch(
        "/api/client/applications/review",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": parsedClient.email,
          },
          body: JSON.stringify({
            applicationId,
            action,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to process submission."
        );
      }

      setMessage(data.message || "Action completed successfully.");

      await loadApplications();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to process submission."
      );
    } finally {
      setProcessingId("");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">
          Loading applications...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white px-8 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              VeroVex
            </h1>

            <p className="text-sm text-gray-500">
              Client Applications
            </p>
          </div>

          <button
            onClick={() =>
              router.push("/client/dashboard")
            }
            className="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-100"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Student Applications
          </h2>

          <p className="mt-2 text-gray-500">
            Review students who applied to your projects.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 font-semibold text-green-700">
            {message}
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
              const project = application.project;
              const submission = project.submission;

              const submitted =
                submission !== null ||
                project.status === "SUBMITTED";

              const completed =
                project.status === "COMPLETED";

              const changesRequested =
                project.status === "IN_PROGRESS" &&
                submission !== null;

              const processing =
                processingId === application.id;

              return (
                <div
                  key={application.id}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {project.title}
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
                          completed
                            ? "bg-green-100 text-green-700"
                            : changesRequested
                              ? "bg-orange-100 text-orange-700"
                              : submitted
                                ? "bg-purple-100 text-purple-700"
                                : application.status === "ACCEPTED"
                                  ? "bg-green-100 text-green-700"
                                  : application.status === "REJECTED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {completed
                          ? "COMPLETED"
                          : changesRequested
                            ? "CHANGES REQUESTED"
                            : submitted
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

                      <p className="mt-1 font-semibold">
                        {project.title}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm font-semibold text-gray-500">
                        Payment
                      </p>

                      <p className="mt-1 font-semibold">
                        ₹
                        {Number(
                          project.paymentAmount
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-semibold text-gray-500">
                      Project Description
                    </p>

                    <p className="mt-2 rounded-lg bg-gray-50 p-4 text-gray-700">
                      {project.description}
                    </p>
                  </div>

                  {submitted && submission && (
                    <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50 p-6">
                      <h4 className="text-lg font-bold text-purple-900">
                        ✓ Student Submission
                      </h4>

                      <p className="mt-1 text-sm text-purple-700">
                        Submitted on{" "}
                        {new Date(
                          submission.submittedAt
                        ).toLocaleString("en-IN")}
                      </p>

                      {submission.description && (
                        <div className="mt-5">
                          <p className="text-sm font-semibold text-gray-700">
                            Work Description
                          </p>

                          <p className="mt-2 rounded-lg bg-white p-4 text-gray-700">
                            {submission.description}
                          </p>
                        </div>
                      )}

                      {submission.fileUrl && (
                        <div className="mt-5">
                          <p className="text-sm font-semibold text-gray-700">
                            Submitted File
                          </p>

                          <a
                            href={submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                          >
                            View Submitted Work
                          </a>
                        </div>
                      )}

                      {!completed && (
                        <div className="mt-6 border-t border-purple-200 pt-6">
                          <p className="mb-4 text-sm font-semibold text-gray-700">
                            Review Submission
                          </p>

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              onClick={() =>
                                reviewSubmission(
                                  application.id,
                                  "APPROVE"
                                )
                              }
                              disabled={processing}
                              className="flex-1 rounded-lg bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {processing
                                ? "Processing..."
                                : "Approve & Pay"}
                            </button>

                            <button
                              onClick={() =>
                                reviewSubmission(
                                  application.id,
                                  "CHANGES"
                                )
                              }
                              disabled={processing}
                              className="flex-1 rounded-lg bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {processing
                                ? "Processing..."
                                : "Request Changes"}
                            </button>
                          </div>
                        </div>
                      )}

                      {completed && (
                        <div className="mt-6 rounded-lg bg-green-100 p-4 text-center">
                          <p className="font-bold text-green-700">
                            ✓ Project Completed & Payment Released
                          </p>

                          <p className="mt-1 text-sm text-green-600">
                            The student has been paid according to the
                            60% earnings split.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {!submitted && (
                    <div className="mt-6 rounded-lg bg-yellow-50 p-4 text-yellow-700">
                      Student has not submitted the completed work yet.
                    </div>
                  )}

                  {changesRequested && (
                    <div className="mt-4 rounded-lg bg-orange-50 p-4 text-sm text-orange-700">
                      Changes have been requested. The student can
                      resubmit the work.
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

