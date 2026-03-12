"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HelpCircle,
  Search,
  BookOpen,
  MessageSquare,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
  FileText,
  Video,
  Users,
  Zap,
  ShieldCheck,
  Scale,
} from "lucide-react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Help articles - TODO: Load from API or CMS
  const helpArticles = [
    {
      id: 1,
      title: "Getting Started with Pacebeats Admin",
      category: "Getting Started",
      description: "Learn the basics of navigating the admin dashboard",
      icon: BookOpen,
      popular: true,
    },
    {
      id: 2,
      title: "Managing Users and Permissions",
      category: "User Management",
      description: "How to add, edit, and manage user accounts",
      icon: Users,
      popular: true,
    },
    {
      id: 3,
      title: "Understanding Analytics Dashboard",
      category: "Analytics",
      description: "Learn how to read and interpret analytics data",
      icon: Zap,
      popular: true,
    },
    {
      id: 4,
      title: "Music Library Management",
      category: "Music",
      description: "Upload, organize, and manage your music tracks",
      icon: FileText,
      popular: false,
    },
    {
      id: 5,
      title: "Session Monitoring and Reports",
      category: "Sessions",
      description: "Track and analyze user running sessions",
      icon: Video,
      popular: false,
    },
    {
      id: 6,
      title: "Security Best Practices",
      category: "Security",
      description: "Keep your admin account secure",
      icon: HelpCircle,
      popular: false,
    },
    {
      id: 7,
      title: "Legal and Compliance Guidance",
      category: "Legal",
      description: "Review terms, privacy, copyright, and provider data-use rules",
      icon: Scale,
      popular: true,
    },
  ];

  const quickLinks = [
    { title: "Help Center", url: "/dashboard/help", icon: BookOpen, external: false },
    { title: "Terms of Use", url: "/dashboard/legal/terms", icon: Scale, external: false },
    { title: "Privacy Policy", url: "/dashboard/legal/privacy", icon: ShieldCheck, external: false },
    {
      title: "Copyright and Data Use",
      url: "/dashboard/legal/copyright",
      icon: FileText,
      external: false,
    },
  ];

  // Filtered articles based on search
  const filteredArticles = helpArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSupport = () => {
    // TODO: Open support ticket modal or navigate to contact form
    window.location.href = "mailto:support@pacebeats.com";
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Help & Support
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          Get help and learn how to make the most of Pacebeats Admin
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for help articles, guides, and tutorials..."
                className="pl-10 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Documentation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Comprehensive guides and references
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={handleContactSupport}
        >
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Contact Support
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get help from our support team
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Video Tutorials
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Watch step-by-step guides
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Help Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Tabs defaultValue="articles" className="w-full">
          <TabsList>
            <TabsTrigger value="articles">Help Articles</TabsTrigger>
            <TabsTrigger value="quick-links">Quick Links</TabsTrigger>
            <TabsTrigger value="legal">Legal & Compliance</TabsTrigger>
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article, index) => {
                const Icon = article.icon;
                return (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {article.title}
                                </h3>
                                {article.popular && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {article.description}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {article.category}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No articles found matching your search
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="quick-links" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="pt-6">
                        <Link
                          href={link.url}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {link.title}
                            </span>
                          </div>
                          {link.external ? (
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="legal" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    Legal and Compliance Documentation
                  </CardTitle>
                  <CardDescription>
                    Central access point for admin-facing policy and provider-use guidance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link
                    href="/dashboard/legal/terms"
                    className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">Terms of Use</p>
                      <p className="text-sm text-muted-foreground">
                        Internal admin access, acceptable use, and operational responsibilities
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>

                  <Link
                    href="/dashboard/legal/privacy"
                    className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">Privacy Policy</p>
                      <p className="text-sm text-muted-foreground">
                        Coverage of user, session, listening, and analytics data handling
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>

                  <Link
                    href="/dashboard/legal/copyright"
                    className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">Copyright and Data Use</p>
                      <p className="text-sm text-muted-foreground">
                        Spotify and third-party metadata usage boundaries and attribution concerns
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Release Checklist
                  </CardTitle>
                  <CardDescription>
                    Minimum documentation checks before production rollout
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Confirm legal review of Spotify, music metadata, and external dataset usage.</p>
                  <p>Align these admin pages with your public website terms and privacy notice.</p>
                  <p>Document retention, export, and access-control rules for user and listening data.</p>
                  <p>Verify internal admin roles only expose data required for approved operations.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Email Support
                  </CardTitle>
                  <CardDescription>
                    Get help via email within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Send us an email and we&apos;ll get back to you as soon as
                    possible.
                  </p>
                  <Button onClick={handleContactSupport} className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Support
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Phone Support
                  </CardTitle>
                  <CardDescription>
                    Talk to our support team directly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <strong>US:</strong> +1 (555) 123-4567
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <strong>Hours:</strong> Mon-Fri, 9am-6pm EST
                  </p>
                  <Button variant="outline" className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
