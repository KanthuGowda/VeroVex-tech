"use client";

import { useEffect, useState } from "react";

type Submission = {
  id: string;
  description: string | null;
  fileUrl: string | null;
  submittedAt: string;
  approvedAt: string | null;
  project: {
    id: string;
    title: string;
    paymentAmount: number | string;
    status: string;
  };
  student: {
    user: {
      name: string;
      email: string;
    };
  };
};

function getAdminEmail() {
  if (typeof window === "undefined") return "";
  
  const stored = localStorage.getItem("verovex_admin");

  if (!stored) return "";

  try {
    const parsed = JSON.parse(stored);
    return parsed.email || "";
  } catch {
    return stored;
  }
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState("");

  async function loadSubmissions() {
    try {
      const email = getAdminEmail();

      if (!email) {
        window.location.href = "/admin/login";
        return;
      }

      const response = await fetch("/api/admin/submissions", {
        headers: {
          "x-user-email": email,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load submissions.");
      }

      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load submissions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function updateSubmission(
    submissionId: string,
    action: "APPROVE" | "REJECT"
  ) {
    try {
      setUpdating(submissionId);
      setMessage("");

      const email = getAdminEmail();

      const response = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": email,
        },
        body: JSON.stringify({
          submissionId,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update submission."
        );
      }

      setMessage(data.message || "Submission updated successfully.");

      await loadSubmissions();
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update submission."
      );
    } finally {
      setUpdating("");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Submissions
          </h1>

          <p className="mt-2 text-gray-600">
            Review work submitted by students.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-blue-700">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            Loading submissions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-800">
              No submissions yet
            </h2>

            <p className="mt-2 text-gray-500">
              Student submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Student
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Project
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Submitted
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Work
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {submissions.map((submission) => {
                    const status = submission.project.status;

                    return (
                      <tr
                        key={submission.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-6 py-5">
                          <div className="font-semibold text-gray-900">
                            {submission.student.user.name}
                          </div>

                          <div className="text-sm text-gray-500">
                            {submission.student.user.email}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="font-semibold text-gray-900">
                            {submission.project.title}
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="font-semibold text-gray-900">
                            ₹
                            {Number(
                              submission.project.paymentAmount
                            ).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={
                              status === "COMPLETED"
                                ? "rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
                                : status === "IN_PROGRESS"
                                ? "rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700"
                                : "rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                            }
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600">
                          {new Date(
                            submission.submittedAt
                          ).toLocaleDateString("en-IN")}
                        </td>

                        <td className="px-6 py-5">
                          <div className="max-w-xs text-sm text-gray-700">
                            {submission.description || "No description provided."}
                          </div>

                          {submission.fileUrl && (
                            <a
                              href={submission.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block text-blue-600 hover:underline"
                            >
                              View File
                            </a>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          {status === "SUBMITTED" ? (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() =>
                                  updateSubmission(
                                    submission.id,
                                    "APPROVE"
                                  )
                                }
                                disabled={updating === submission.id}
                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {updating === submission.id
                                  ? "Updating..."
                                  : "Approve"}
                              </button>

                              <button
                                onClick={() =>
                                  updateSubmission(
                                    submission.id,
                                    "REJECT"
                                  )
                                }
                                disabled={updating === submission.id}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {updating === submission.id
                                  ? "Updating..."
                                  : "Request Changes"}
                              </button>
                            </div>
                          ) : status === "COMPLETED" ? (
                            <span className="font-semibold text-green-600">
                              Approved
                            </span>
                          ) : (
                            <span className="font-semibold text-yellow-600">
                              Waiting for resubmission
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}