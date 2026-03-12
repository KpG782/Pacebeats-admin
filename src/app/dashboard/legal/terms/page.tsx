import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Terms of Use
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Effective date: March 12, 2026
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Use and Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Pacebeats Admin is intended for authorized internal administrators,
            support personnel, and operators managing the Pacebeats platform.
          </p>
          <p>
            Access to user, session, analytics, and music data must be limited
            to legitimate operational, support, compliance, and reporting use.
          </p>
          <p>
            Administrators must not export, redistribute, or reuse data outside
            approved business workflows without documented authorization.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Third-Party Services and Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Spotify metadata, identifiers, preview URLs, and other third-party
            platform content remain subject to the rights and policies of their
            respective owners.
          </p>
          <p>
            Pacebeats Admin must not be used to claim ownership of third-party
            songs, artwork, metadata, or recommendation outputs derived from
            third-party services.
          </p>
          <p>
            Any display or processing of third-party data should remain within
            the scope permitted by the relevant provider terms, developer
            agreements, and applicable law.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operational Responsibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Admin users are responsible for safeguarding credentials, using the
            dashboard only for approved purposes, and reporting suspected abuse,
            data exposure, or policy violations promptly.
          </p>
          <p>
            This document is an operational template for the admin console and
            should be reviewed with legal counsel before production release.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
