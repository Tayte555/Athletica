import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/UI/AuthLayout";
import ErrorModal from "../../components/UI/ErrorModal";
import {
  validateRegisterForm,
  type RegisterErrors,
  type RegisterFormData,
} from "../../lib/authValidation";

type TouchedFields = Partial<Record<keyof RegisterFormData, boolean>>;

const initialFormData: RegisterFormData = {
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
};

export default function RegistrationPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);
  const [touched, setTouched] = useState<TouchedFields>({});
  const [submitting, setSubmitting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const errors: RegisterErrors = useMemo(
    () => validateRegisterForm(formData),
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
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const showFieldError = (field: keyof RegisterFormData) =>
    touched[field] && errors[field];

  const inputClass = (field: keyof RegisterFormData) =>
    `w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
      showFieldError(field)
        ? "border-red-500 bg-red-50"
        : "border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allTouched: TouchedFields = {
      email: true,
      username: true,
      password: true,
      confirmPassword: true,
    };
    setTouched(allTouched);

    const validationErrors = validateRegisterForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("http://localhost:5555/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          username: formData.username.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalMessage(data.message || "Registration failed");
        setModalOpen(true);
        return;
      }

      navigate("/login", {
        state: { successMessage: "Registration successful. Please log in." },
      });
    } catch (error) {
      console.error("Error during registration:", error);
      setModalMessage("Could not connect to the server. Please try again.");
      setModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AuthLayout
        title="Create your account"
        subtitle="Join Athletica and start building your training journey."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
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
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. TayteKeates55"
              className={inputClass("username")}
            />
            <p className="mt-2 min-h-[20px] text-sm text-red-500">
              {showFieldError("username") || ""}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
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
                placeholder="Enter a strong password"
                className={inputClass("password")}
              />
              <p className="mt-2 min-h-[20px] text-sm text-red-500">
                {showFieldError("password") || ""}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Re-enter your password"
                className={inputClass("confirmPassword")}
              />
              <p className="mt-2 min-h-[20px] text-sm text-red-500">
                {showFieldError("confirmPassword") || ""}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
            Password must be 8–30 characters and include an uppercase letter, a
            number, and a special character.
          </div>

          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Creating account..." : "Register"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Log in
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
