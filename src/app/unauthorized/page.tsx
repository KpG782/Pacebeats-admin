"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldX, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      router.push("/login");
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2 border-destructive/20">
          <CardContent className="p-12 text-center space-y-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="p-6 bg-destructive/10 rounded-full">
                <ShieldX className="w-20 h-20 text-destructive" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Access Denied
              </h1>
              <p className="text-xl text-muted-foreground">
                Administrator Privileges Required
              </p>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <p className="text-muted-foreground leading-relaxed">
                This dashboard is restricted to administrators only. Your
                account does not have the necessary permissions to access this
                area.
              </p>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  If you believe this is an error, please contact your system
                  administrator or the support team for assistance.
                </p>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Button
                onClick={() => router.push("/login")}
                size="lg"
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Button>
              <Button
                onClick={() =>
                  (window.location.href =
                    "mailto:admin@pacebeats.com?subject=Access Request")
                }
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </Button>
            </motion.div>

            {/* Auto-redirect notice */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xs text-muted-foreground pt-4"
            >
              You will be redirected to the login page in 10 seconds...
            </motion.p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          © 2025 Pacebeats. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
