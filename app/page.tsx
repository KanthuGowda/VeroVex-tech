export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 border-b">
        <div className="text-2xl font-bold">
          VeroVex
        </div>

        <div className="flex gap-6">
          <a href="#" className="hover:text-blue-600">
            Home
          </a>

          <a href="#about" className="hover:text-blue-600">
            About
          </a>

          <a href="#contact" className="hover:text-blue-600">
            Contact
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex min-h-[600px] flex-col items-center justify-center px-6 text-center">

        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-600">
          Welcome to VeroVex
        </p>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-6xl">
          Connecting Students With Opportunities
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          VeroVex helps students discover opportunities and
          connects organizations with talented students.
        </p>

        {/* Login Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">

          <a
            href="/student/login"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Student Login
          </a>

          <a
            href="/client/login"
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-100"
          >
            Client Login
          </a>

          <a
            href="/admin/login"
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-100"
          >
            Admin Login
          </a>

        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="border-t bg-gray-50 px-6 py-24 text-center"
      >

        <h2 className="text-3xl font-bold">
          What is VeroVex?
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-gray-600">
          VeroVex is a platform designed to connect students,
          organizations and administrators in one place.
        </p>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">

          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold">
              Students
            </h3>

            <p className="mt-3 text-gray-600">
              Create your profile, discover opportunities
              and apply for positions.
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold">
              Clients
            </h3>

            <p className="mt-3 text-gray-600">
              Find talented students and manage your
              opportunities.
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-sm">
            <h3 className="text-xl font-bold">
              Admin
            </h3>

            <p className="mt-3 text-gray-600">
              Manage students, clients and the entire
              VeroVex platform.
            </p>
          </div>

        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="px-6 py-20 text-center"
      >
        <h2 className="text-3xl font-bold">
          Get Started With VeroVex
        </h2>

        <p className="mt-4 text-gray-600">
          Join the platform and start connecting with opportunities.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t px-8 py-6 text-center text-sm text-gray-500">
        © 2026 VeroVex. All rights reserved.
      </footer>

    </main>
  );
}