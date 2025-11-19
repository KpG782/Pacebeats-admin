"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    document.documentElement.classList.toggle("dark");
  };

  const handleAutoFill = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setEmail("admin@pacebeats.com");
    setPassword("admin123");
    setErrors({ email: "", password: "" });
  };

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // TODO: Replace with actual API call
    // Example:
    // try {
    //   const response = await fetch('/api/auth/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, password, rememberMe })
    //   });
    //
    //   if (!response.ok) {
    //     throw new Error('Invalid credentials');
    //   }
    //
    //   const data = await response.json();
    //   localStorage.setItem('authToken', data.token);
    //   localStorage.setItem('adminUser', JSON.stringify(data.user));
    //   router.push('/dashboard');
    // } catch (error) {
    //   setErrors({ ...errors, password: 'Invalid email or password' });
    //   setIsLoading(false);
    // }

    // Simulate API call - Remove this in production
    setTimeout(() => {
      // Mock success - store token for demo
      localStorage.setItem("authToken", "mock_token_" + Date.now());
      localStorage.setItem(
        "adminUser",
        JSON.stringify({
          id: "ADM001",
          name: "Admin User",
          email: email,
          role: "super_admin",
        })
      );

      setIsLoading(false);
      router.push("/dashboard");
    }, 1500);
  };

  // Handle forgot password - Ready for backend integration
  const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // TODO: Navigate to forgot password page or show modal
    // router.push('/forgot-password');
    alert(
      "Forgot password functionality will be implemented with backend integration"
    );
  };

  // Handle contact support - Ready for backend integration
  const handleContactSupport = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // TODO: Open support modal or navigate to support page
    // router.push('/support');
    handleAutoFill(e); // For demo purposes, using autofill
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-6xl"
      >
        <div className="grid lg:grid-cols-2 gap-0 bg-card rounded-2xl shadow-2xl overflow-hidden border">
          {/* Left Side - Image */}
          <div className="hidden lg:flex relative bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 p-12 flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Image
                  src="/logo.png"
                  alt="Pacebeats Logo"
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-xl"
                />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  Pacebeats
                </span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Manage Your Music Platform
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Powerful tools to manage users, sessions, and analytics all in
                one place.
              </p>
            </div>

            {/* Placeholder for image - you can replace this with your actual image */}
            <div className="relative h-64 mt-8 rounded-xl overflow-hidden bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <Image
                src="/login-illustration.png"
                alt="Dashboard Illustration"
                width={400}
                height={300}
                className="object-contain"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-6xl text-primary/20">
                🎵
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 lg:p-12">
            {/* Dark Mode Toggle */}
            <div className="flex justify-end mb-6">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-white" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Mobile Logo & Title */}
            <div className="flex flex-col mb-8 lg:hidden">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="Pacebeats Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-xl"
                />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Pacebeats
                </span>
              </div>
            </div>

            {/* Form Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-700 dark:text-gray-300">
                Sign in to access the Admin Dashboard
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-gray-900 dark:text-white font-medium"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@pacebeats.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  className={`text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-gray-900 dark:text-white font-medium"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors({ ...errors, password: "" });
                    }}
                    className={`text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 pr-10 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-gray-800 dark:text-gray-300 cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <a
                  href="#"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-6"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Need help?{" "}
                <a
                  href="#"
                  onClick={handleContactSupport}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          © 2025 Pacebeats. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
