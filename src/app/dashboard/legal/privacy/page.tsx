import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Effective date: March 12, 2026
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Covered</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Pacebeats Admin may display account data, profile details, running
            session records, listening events, music metadata, and analytics
            derived from platform activity.
          </p>
          <p>
            Depending on integrations enabled in the platform, this may include
            Spotify-related identifiers, playback metadata, and user preference
            signals used to support recommendations and reporting.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Use of Personal Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Personal and behavioral data should only be accessed for platform
            operations, support, fraud prevention, analytics, and compliance.
          </p>
          <p>
            Administrators should follow least-privilege access principles and
            avoid unnecessary viewing, exporting, or retention of user data.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Retention and Protection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Data displayed in the admin dashboard should be retained only as
            long as required for product operations, security, legal
            obligations, and documented business purposes.
          </p>
          <p>
            Access controls, auditability, secure storage, and restricted
            exports should be applied to all user and analytics data processed
            through the admin dashboard.
          </p>
          <p>
            This page is a product-facing policy template and should be aligned
            with your public privacy notice and legal review before release.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
