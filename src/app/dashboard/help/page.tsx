"use client";

import { useState } from "react";
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
  ];

  // Quick links - TODO: Update with actual documentation URLs
  const quickLinks = [
    { title: "Documentation", url: "#", icon: BookOpen },
    { title: "Video Tutorials", url: "#", icon: Video },
    { title: "API Reference", url: "#", icon: FileText },
    { title: "Release Notes", url: "#", icon: FileText },
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
                        <a
                          href={link.url}
                          className="flex items-center justify-between"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {link.title}
                            </span>
                          </div>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </a>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
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
