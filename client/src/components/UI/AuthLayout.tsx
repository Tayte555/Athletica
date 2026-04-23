import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-100 px-4 py-4">
      <div className="mx-auto grid min-h-[92vh] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8 text-white">
          <div>
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">
              Athletica
            </div>

            <h1 className="max-w-md text-4xl font-bold leading-tight">
              Build routines, stay consistent, and train with purpose.
            </h1>

            <p className="mt-4 max-w-md text-sm leading-7 text-slate-200">
              A cleaner, more social fitness experience for planning workouts,
              discovering routines, and staying accountable.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-slate-100">
              “Consistency beats intensity when intensity only happens once.”
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-xl">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>

            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>

            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
