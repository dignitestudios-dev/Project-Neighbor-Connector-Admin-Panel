import * as Yup from "yup";

// --------------------
// Sign In / Login
// --------------------
export const signInSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address.")
    .required("Please enter your email"),
  password: Yup.string()
    .matches(/^(?!\s)(?!.*\s$)/, "Password must not begin or end with spaces")
    .min(6, "Password must contain at least 6 characters.")
    .required("Please enter your password"),
});

// --------------------
// Forgot Password
// --------------------
export const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address.")
    .required("Please enter your email"),
});

// --------------------
// Update Password (Reset via email)
// --------------------
export const updatePasswordSchema = Yup.object({
  password: Yup.string()
    .matches(/^(?!\s)(?!.*\s$)/, "Password must not begin or end with spaces")
    .min(6, "Password must contain at least 6 characters.")
    .required("Please enter your password"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

// --------------------
// Change Password (while logged in)
// --------------------
export const changePasswordSchema = Yup.object({
  old_password: Yup.string()
    .matches(/^(?!\s)(?!.*\s$)/, "Password must not begin or end with spaces")
    .min(6, "Password must contain at least 6 characters.")
    .required("Please enter your current password"),
  password: Yup.string()
    .matches(/^(?!\s)(?!.*\s$)/, "Password must not begin or end with spaces")
    .min(6, "Password must contain at least 6 characters.")
    .required("Please enter your new password"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your new password"),
});

// --------------------
// Change Email
// --------------------
export const changeEmailSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address.")
    .required("Please enter your email"),
});

// --------------------
// Change Phone Number
// --------------------
export const changeNumberSchema = Yup.object({
  phone: Yup.string()
    .matches(/^[0-9]*$/, "Only digits are allowed")
    .required("Please enter your phone number"),
});

// --------------------
// Update DOB & Gender
// --------------------
export const changeDOBGenderSchema = Yup.object({
  dob: Yup.date()
    .required("Please select your date of birth.")
    .max(new Date(), "Future dates are not allowed."),
  gender: Yup.string().required("Please select your gender."),
});