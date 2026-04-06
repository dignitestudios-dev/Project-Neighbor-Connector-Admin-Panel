"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { loginUser } from "@/lib/slices/authSlice";
import { signInSchema } from "@/lib/validation/authschema";
import type { AppDispatch } from "@/lib/store";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const loginValues = {
    email: "",
    password: "",
  };

  const formik = useFormik({
    initialValues: loginValues,
    validationSchema: signInSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting, setErrors, resetForm }) => {
      try {
        const payload = {
          email: values.email,
          password: values.password,
        
        };

        // Redux login
        await dispatch(loginUser(payload)).unwrap();
     

        // Login success → navigate
      
      } catch (err: any) {
        // API error
        resetForm();
        setErrors({ email: err?.message || "Login failed" });
        setSubmitting(false);
        
      }
    },
  });

  return (
    <div className="w-full max-w-md mx-auto mt-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your account</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">

        {/* Email */}
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
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-sm">{formik.errors.password}</p>
          )}
        </div>
        <button
    type="button"
    onClick={() => router.push("/auth/forgot-password")}
    className="text-sm text-blue-600 hover:underline"
  >
    Forgot Password?
  </button>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? "Signing In..." : "Sign In"}
        </Button>

      </form>
    </div>
  );
};

export default Login;