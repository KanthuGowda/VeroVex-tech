import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link href="/" className="text-2xl font-bold">
            Vero<span className="text-blue-600">Vex</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/student/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 sm:block"
            >
              Student Login
            </Link>

            <Link
              href="/client/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 sm:block"
            >
              Client Login
            </Link>

            <Link
              href="/admin/login"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              Admin Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-6 py-24">
        <div className="mx-auto max-w-6xl text-center">

          <div className="mb-6 inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            🚀 Student • Client • Opportunity
          </div>

          <h1 className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tight md:text-7xl">
            Turn Skills Into
            <span className="text-blue-600"> Real Opportunities.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-gray-600">
            VeroVex connects talented students with organizations looking
            for skilled people to complete real-world projects.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">

            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
            >
              Join VeroVex →
            </Link>

            <Link
              href="/client/login"
              className="rounded-xl border border-gray-300 bg-white px-7 py-3.5 font-semibold text-gray-800 hover:bg-gray-50"
            >
              I'm a Client
            </Link>

            <Link
              href="/admin/login"
              className="rounded-xl border border-gray-300 bg-white px-7 py-3.5 font-semibold text-gray-800 hover:bg-gray-50"
            >
              🔐 Admin Login
            </Link>

          </div>

          {/* Quick Stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="text-3xl font-bold text-blue-600">👨‍🎓</div>
              <h3 className="mt-3 font-bold">Students</h3>
              <p className="mt-1 text-sm text-gray-500">
                Build experience
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="text-3xl font-bold text-blue-600">💼</div>
              <h3 className="mt-3 font-bold">Clients</h3>
              <p className="mt-1 text-sm text-gray-500">
                Find talented people
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="text-3xl font-bold text-blue-600">🚀</div>
              <h3 className="mt-3 font-bold">Projects</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get real work done
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">

          <div className="text-center">
            <p className="font-semibold text-blue-600">
              VeroVex Marketplace
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              Available Projects
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Discover real projects posted by organizations and
              turn your skills into practical experience.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {/* Project 1 */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-center justify-between">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  LIVE
                </span>

                <span className="text-sm text-gray-500">
                  Remote
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold">
                Website Development
              </h3>

              <p className="mt-3 text-sm text-gray-500">
                React • Next.js • Tailwind
              </p>

              <div className="mt-6 flex items-end justify-between">
                <span className="text-2xl font-bold">
                  ₹25,000
                </span>

                <span className="text-sm text-gray-500">
                  5 applicants
                </span>
              </div>
            </div>

            {/* Project 2 */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-center justify-between">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  LIVE
                </span>

                <span className="text-sm text-gray-500">
                  Remote
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold">
                Data Analysis Project
              </h3>

              <p className="mt-3 text-sm text-gray-500">
                Python • SQL • Excel
              </p>

              <div className="mt-6 flex items-end justify-between">
                <span className="text-2xl font-bold">
                  ₹15,000
                </span>

                <span className="text-sm text-gray-500">
                  3 applicants
                </span>
              </div>
            </div>

            {/* Project 3 */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

              <div className="flex items-center justify-between">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  LIVE
                </span>

                <span className="text-sm text-gray-500">
                  Remote
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold">
                UI/UX Design
              </h3>

              <p className="mt-3 text-sm text-gray-500">
                Figma • UI Design
              </p>

              <div className="mt-6 flex items-end justify-between">
                <span className="text-2xl font-bold">
                  ₹12,000
                </span>

                <span className="text-sm text-gray-500">
                  7 applicants
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 px-6 py-24">
        <div className="mx-auto max-w-6xl">

          <div className="text-center">
            <p className="font-semibold text-blue-600">
              Simple Process
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              How VeroVex Works
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              A simple platform for students and clients to connect
              and complete projects.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <div className="text-5xl">👨‍🎓</div>

              <h3 className="mt-6 text-xl font-bold">
                1. Students Join
              </h3>

              <p className="mt-4 leading-7 text-gray-600">
                Create a profile, showcase your skills and discover
                projects that match your abilities.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <div className="text-5xl">💼</div>

              <h3 className="mt-6 text-xl font-bold">
                2. Clients Post Projects
              </h3>

              <p className="mt-4 leading-7 text-gray-600">
                Clients publish projects with requirements, skills
                and fixed project payments.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <div className="text-5xl">🤝</div>

              <h3 className="mt-6 text-xl font-bold">
                3. Work & Get Paid
              </h3>

              <p className="mt-4 leading-7 text-gray-600">
                Students complete projects, clients review the work
                and payments are processed through VeroVex.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* About */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="font-semibold text-blue-600">
              About VeroVex
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              Building a bridge between talent and opportunity.
            </h2>

            <p className="mt-6 leading-8 text-gray-600">
              VeroVex is designed to help students gain practical
              experience by working on real projects while helping
              organizations find talented students.
            </p>

            <p className="mt-4 leading-8 text-gray-600">
              Our platform brings students, clients and administrators
              together in one connected ecosystem.
            </p>

          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border p-7">
              <div className="text-3xl">🎯</div>
              <h3 className="mt-5 font-bold">Real Projects</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Gain practical experience through real-world work.
              </p>
            </div>

            <div className="rounded-2xl border p-7">
              <div className="text-3xl">💰</div>
              <h3 className="mt-5 font-bold">Project Payments</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Transparent fixed-price project payments.
              </p>
            </div>

            <div className="rounded-2xl border p-7">
              <div className="text-3xl">🔐</div>
              <h3 className="mt-5 font-bold">Secure Platform</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                User roles and platform administration in one place.
              </p>
            </div>

            <div className="rounded-2xl border p-7">
              <div className="text-3xl">📈</div>
              <h3 className="mt-5 font-bold">Grow Your Skills</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Build experience and strengthen your portfolio.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-blue-600 px-8 py-16 text-center text-white">

          <h2 className="text-4xl font-bold">
            Ready to get started?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-blue-100">
            Join VeroVex and start connecting skills, projects
            and opportunities.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">

            <Link
              href="/register"
              className="rounded-xl bg-white px-7 py-3.5 font-semibold text-blue-600 hover:bg-gray-100"
            >
              Create Student Account
            </Link>

            <Link
              href="/register/client"
              className="rounded-xl border border-blue-300 px-7 py-3.5 font-semibold text-white hover:bg-blue-700"
            >
              Register as Client
            </Link>

            <Link
              href="/admin/login"
              className="rounded-xl border border-blue-300 px-7 py-3.5 font-semibold text-white hover:bg-blue-700"
            >
              Admin Login
            </Link>

          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t bg-gray-50 px-6 py-20 text-center">

        <p className="font-semibold text-blue-600">
          Contact
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          Let's build opportunities together.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-gray-600">
          Whether you're a student looking for experience or a
          client looking for talent, VeroVex is built for you.
        </p>

      </section>

      {/* Footer */}
      <footer className="border-t bg-white px-6 py-10">

        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="text-2xl font-bold">
              Vero<span className="text-blue-600">Vex</span>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Connecting skills, projects and opportunities.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm">

            <Link
              href="/student/login"
              className="text-gray-600 hover:text-blue-600"
            >
              Student Login
            </Link>

            <Link
              href="/client/login"
              className="text-gray-600 hover:text-blue-600"
            >
              Client Login
            </Link>

            <Link
              href="/admin/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Admin Login
            </Link>

          </div>

        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t pt-6 text-center text-sm text-gray-500">
          © 2026 VeroVex. All rights reserved.
        </div>

      </footer>

    </main>
  );
}