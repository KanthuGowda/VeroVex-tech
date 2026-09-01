"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string;
  totalAmount: number;
  platformFee: number;
  studentAmount: number;
  status: string;
  createdAt: string;
  project: {
    title: string;
  };
  student: {
    user: {
      name: string;
      email: string;
    };
  };
  client: {
    user: {
      name: string;
      email: string;
    };
  };
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((res) => res.json())
      .then((data) => {
        setPayments(data.payments || []);
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
            Payments
          </h1>

          <p className="mt-2 text-gray-600">
            Manage project payments and platform fees.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-6 shadow">
            Loading payments...
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-800">
              No payments yet
            </h2>

            <p className="mt-2 text-gray-500">
              Payments will appear here after completed projects.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left">Project</th>
                    <th className="px-6 py-4 text-left">Client</th>
                    <th className="px-6 py-4 text-left">Student</th>
                    <th className="px-6 py-4 text-left">Total</th>
                    <th className="px-6 py-4 text-left">
                      Platform 40%
                    </th>
                    <th className="px-6 py-4 text-left">
                      Student 60%
                    </th>
                    <th className="px-6 py-4 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-t"
                    >
                      <td className="px-6 py-4 font-semibold">
                        {payment.project.title}
                      </td>

                      <td className="px-6 py-4">
                        <div>{payment.client.user.name}</div>
                        <div className="text-sm text-gray-500">
                          {payment.client.user.email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>{payment.student.user.name}</div>
                        <div className="text-sm text-gray-500">
                          {payment.student.user.email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        ₹
                        {Number(
                          payment.totalAmount
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4">
                        ₹
                        {Number(
                          payment.platformFee
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4">
                        ₹
                        {Number(
                          payment.studentAmount
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                          {payment.status}
                        </span>
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