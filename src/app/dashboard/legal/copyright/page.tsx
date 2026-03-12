import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CopyrightPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Copyright and Data Use
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Effective date: March 12, 2026
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Music and Metadata Ownership</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Song titles, artist names, preview URLs, Spotify identifiers, and
            other third-party metadata displayed in Pacebeats Admin remain the
            property of their respective rights holders and data providers.
          </p>
          <p>
            Displaying third-party metadata inside the admin dashboard does not
            transfer ownership or grant redistribution rights.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spotify and External Provider Notice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Spotify-related data should be handled in accordance with the
            applicable Spotify developer terms, branding rules, content usage
            restrictions, and any related platform agreements in force for your
            application.
          </p>
          <p>
            If other music or analytics datasets are used, their source
            licenses, attribution requirements, and permitted use conditions
            should also be documented and followed.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Internal Admin Restrictions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Administrators must not use the dashboard to bulk extract,
            republish, or commercially redistribute third-party music metadata
            or copyrighted materials beyond the rights granted by the source
            provider.
          </p>
          <p>
            This page is a compliance-oriented admin reference and should be
            reviewed by legal counsel before you rely on it as a formal public
            policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
