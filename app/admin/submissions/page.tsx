"use client";

import { useEffect, useState } from "react";

type Submission = {
  id: string;
  description: string;
  fileUrl: string | null;
  submittedAt: string;
  project: {
    title: string;
    paymentAmount: number;
    status: string;
  };
  student: {
    user: {
      name: string;
      email: string;
    };
  };
};

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/submissions")
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data.submissions || []);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Submissions
          </h1>

          <p className="mt-2 text-gray-600">
            Review work submitted by students.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-6 shadow">
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
                    <th className="px-6 py-4 text-left">
                      Student
                    </th>

                    <th className="px-6 py-4 text-left">
                      Project
                    </th>

                    <th className="px-6 py-4 text-left">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-left">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left">
                      Submitted
                    </th>

                    <th className="px-6 py-4 text-left">
                      Work
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {submissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="border-t"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold">
                          {submission.student.user.name}
                        </div>

                        <div className="text-sm text-gray-500">
                          {submission.student.user.email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold">
                          {submission.project.title}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        ₹
                        {Number(
                          submission.project.paymentAmount
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                          {submission.project.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(
                          submission.submittedAt
                        ).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-6 py-4">
                        <div className="max-w-xs text-sm text-gray-700">
                          {submission.description}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}