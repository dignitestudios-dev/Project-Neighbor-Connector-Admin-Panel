"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AppDispatch, RootState } from "@/lib/store";
import { forgotPassword, setEmail } from "@/lib/slices/authSlice";
import { toast, Toaster } from "sonner";

const ForgotPassword = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Email is required"),
  });
const formik = useFormik({
  initialValues: { email: "" },
  validationSchema,
  onSubmit: async (values) => {
    try {
      await dispatch(
        forgotPassword({
          email: values.email,
          role: "admin",
        })
      ).unwrap();

      dispatch(setEmail(values.email));
      router.push("/auth/verification");
      toast.success("OTP sent successfully");
    } catch (err: any) {
  const message = err?.message || err || "Something went wrong";
  toast.error(message);
}
  },
});

  return (
    <div className="w-full max-w-md mx-auto mt-12">
      <Toaster/>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h2>
        <p className="text-gray-600">
          Enter your email address and we'll send you an OTP to reset your password
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-sm">{formik.errors.email}</p>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </Button>

        <div className="text-center">
          <Link href="/auth/login" className="text-sm text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;