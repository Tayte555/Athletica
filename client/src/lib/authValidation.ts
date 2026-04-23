export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const usernameRegex = /^(?=.{3,20}$)[a-zA-Z0-9._]+$/;
export const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,30}$/;

export type RegisterFormData = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

export type LoginFormData = {
  email: string;
  password: string;
};

export type RegisterErrors = Partial<Record<keyof RegisterFormData, string>>;
export type LoginErrors = Partial<Record<keyof LoginFormData, string>>;

export function validateRegisterForm(
  formData: RegisterFormData,
): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "Invalid email format";
  }

  if (!formData.username.trim()) {
    errors.username = "Username is required";
  } else if (formData.username.length < 3) {
    errors.username = "Minimum 3 characters";
  } else if (formData.username.length > 20) {
    errors.username = "Maximum 20 characters";
  } else if (!usernameRegex.test(formData.username)) {
    errors.username = "Use only letters, numbers, dots and underscores";
  }

  if (!formData.password) {
    errors.password = "Password is required";
  } else if (formData.password.length < 8) {
    errors.password = "Minimum 8 characters";
  } else if (formData.password.length > 30) {
    errors.password = "Maximum 30 characters";
  } else if (!passwordRegex.test(formData.password)) {
    errors.password =
      "Must include an uppercase letter, a number and a special character";
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = "Confirm password is required";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}

export function validateLoginForm(formData: LoginFormData): LoginErrors {
  const errors: LoginErrors = {};

  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "Invalid email format";
  }

  if (!formData.password) {
    errors.password = "Password is required";
  }

  return errors;
}
