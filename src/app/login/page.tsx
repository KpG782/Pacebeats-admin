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
import { supabase, signInWithEmail } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }

    // Check if user is already logged in and has admin role
    const checkAuth = async () => {
      // First, check current session without listener
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Verify user has admin role before redirecting
        const { data: userProfile } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (userProfile?.role === "admin") {
          router.push("/dashboard");
          return;
        }
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

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

    try {
      if (isSignUp) {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              role: "admin", // Store admin role in user metadata
            },
          },
        });

        if (error) throw error;

        // Check if user already exists
        if (data?.user?.identities?.length === 0) {
          toast({
            title: "User Already Exists",
            description:
              "This email is already registered. Please sign in instead.",
            variant: "destructive",
          });
          setIsSignUp(false);
          setIsLoading(false);
          return;
        }

        // Insert user into the users table
        if (data.user) {
          const { error: insertError } = await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email!,
            username: data.user.email!.split("@")[0], // Default name from email
            role: "admin",
            created_at: new Date().toISOString(),
          });

          if (insertError) {
            console.error("Error inserting user:", insertError);
          }
        }

        toast({
          title: "Account Created! 🎉",
          description: "You can now sign in with your credentials.",
        });

        // Switch to sign-in mode
        setIsSignUp(false);
        setIsLoading(false);
      } else {
        // Sign in existing user
        const { user } = await signInWithEmail(email, password);

        // Fetch user profile from database to check role
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("id, email, username, role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          throw new Error("Failed to verify user permissions");
        }

        // Check if user has admin role
        if (userProfile.role !== "admin") {
          // Sign out the non-admin user
          await supabase.auth.signOut();

          toast({
            title: "Access Denied",
            description:
              "This dashboard is only accessible to administrators. Please contact support if you believe this is an error.",
            variant: "destructive",
          });

          setIsLoading(false);
          return;
        }

        // Store session info if remember me is checked
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }

        // Store admin user info for dashboard
        localStorage.setItem(
          "adminUser",
          JSON.stringify({
            id: userProfile.id,
            email: userProfile.email,
            username: userProfile.username,
            role: userProfile.role,
          })
        );

        toast({
          title: "Login Successful",
          description: `Welcome back, ${
            userProfile.username || userProfile.email
          }!`,
        });

        // Redirect to dashboard
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Authentication error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Authentication failed";

      setErrors({ ...errors, password: errorMessage });

      toast({
        title: isSignUp ? "Sign Up Failed" : "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });

      setIsLoading(false);
    }
  };

  // Handle forgot password - Ready for backend integration
  const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // TODO: Implement password reset with Supabase
    // Example:
    // const { error } = await supabase.auth.resetPasswordForEmail(email);
    toast({
      title: "Password Reset",
      description: "Password reset functionality will be available soon.",
    });
  };

  // Handle contact support - Ready for backend integration
  const handleContactSupport = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // TODO: Open support modal or navigate to support page
    // router.push('/support');
    handleAutoFill(e); // For demo purposes, using autofill
  };

  return (
    <>
      {isCheckingAuth ? (
        <LoadingSpinner
          fullScreen
          variant="music"
          text="Checking authentication..."
          size="xl"
        />
      ) : (
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
                    Powerful tools to manage users, sessions, and analytics all
                    in one place.
                  </p>
                </div>

                {/* Placeholder for image - you can replace this with your actual image */}
                <div className="relative h-64 mt-8 rounded-xl overflow-hidden bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <div className="flex items-center justify-center text-8xl text-primary/30">
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
                    {isSignUp ? "Create Admin Account" : "Welcome Back"}
                  </h1>
                  <p className="text-gray-700 dark:text-gray-300">
                    {isSignUp
                      ? "Sign up to create a new admin account"
                      : "Sign in to access the Admin Dashboard"}
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
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
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
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
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
                    ) : isSignUp ? (
                      "Create Account"
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                {/* Sign Up Toggle */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {isSignUp
                      ? "Already have an account?"
                      : "Don't have an account?"}{" "}
                    <button
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setErrors({ email: "", password: "" });
                      }}
                      disabled={isLoading}
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                  </p>
                </div>

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
      )}
    </>
  );
}
