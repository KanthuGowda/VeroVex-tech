"use client";

import { useEffect, useState } from "react";

type Application = {
  id: string;
  status: string;
  appliedAt: string;
  project: {
    id: string;
    title: string;
    paymentAmount: number;
    status: string;
  };
  student: {
    id: string;
    phone: string | null;
    college: string | null;
    course: string | null;
    graduationYear: number | null;
    user: {
      name: string;
      email: string;
    };
  };
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/applications")
      .then((res) => res.json())
      .then((data) => {
        setApplications(data.applications || []);
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
            Applications
          </h1>
          <p className="mt-2 text-gray-600">
            Manage all student applications on VeroVex.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-6 shadow">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-800">
              No applications yet
            </h2>
            <p className="mt-2 text-gray-500">
              Student applications will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left">Student</th>
                    <th className="px-6 py-4 text-left">Project</th>
                    <th className="px-6 py-4 text-left">Payment</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Applied</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-t"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold">
                          {application.student.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.student.user.email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold">
                          {application.project.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          Project status: {application.project.status}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        ₹
                        {Number(
                          application.project.paymentAmount
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                          {application.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(
                          application.appliedAt
                        ).toLocaleDateString("en-IN")}
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