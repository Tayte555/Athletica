import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/UI/AuthLayout";
import ErrorModal from "../../components/UI/ErrorModal";
import {
  validateLoginForm,
  type LoginErrors,
  type LoginFormData,
} from "../../lib/authValidation";

type TouchedFields = Partial<Record<keyof LoginFormData, boolean>>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState<TouchedFields>({});
  const [submitting, setSubmitting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const successMessage = location.state?.successMessage;

  const errors: LoginErrors = useMemo(
    () => validateLoginForm(formData),
    [formData],
  );

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched((prev) => ({
      ...prev,
      [e.target.name]: true,
    }));
  };

  const showFieldError = (field: keyof LoginFormData) =>
    touched[field] && errors[field];

  const inputClass = (field: keyof LoginFormData) =>
    `w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
      showFieldError(field)
        ? "border-red-500 bg-red-50"
        : "border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    }`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
    });

    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("http://localhost:5555/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalMessage(data.message || "Login failed");
        setModalOpen(true);
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setModalMessage("Could not connect to the server. Please try again.");
      setModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AuthLayout
        title="Welcome back"
        subtitle="Log in to continue building and tracking your routines."
      >
        <form onSubmit={handleLogin} className="space-y-5">
          {successMessage && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. johnsmith@example.com"
              className={inputClass("email")}
            />
            <p className="mt-2 min-h-[20px] text-sm text-red-500">
              {showFieldError("email") || ""}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your password"
              className={inputClass("password")}
            />
            <p className="mt-2 min-h-[20px] text-sm text-red-500">
              {showFieldError("password") || ""}
            </p>
          </div>

          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </AuthLayout>

      <ErrorModal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
