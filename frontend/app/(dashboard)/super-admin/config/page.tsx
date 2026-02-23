"use client";

import { Globe, Info, Mail, Shield, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ConfigRow {
  label: string;
  value: string;
  description?: string;
}

function ConfigSection({
  icon: Icon,
  title,
  description,
  rows,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  rows: ConfigRow[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50">
          <Icon className="h-5 w-5 text-accent-600" />
        </div>
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        {rows.map((row, idx) => (
          <div key={row.label}>
            {idx !== 0 && <Separator />}
            <div className="flex items-center justify-between px-6 py-3">
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  {row.label}
                </p>
                {row.description && (
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {row.description}
                  </p>
                )}
              </div>
              <span className="ml-4 shrink-0 text-sm text-neutral-600">
                {row.value}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function SuperAdminConfigPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Configuration"
        description="System-level settings and platform information"
        actions={
          <Badge variant="info" size="sm">
            <Info className="mr-1 h-3 w-3" />
            Read-only
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ConfigSection
          icon={Globe}
          title="Platform"
          description="General platform information"
          rows={[
            {
              label: "Platform Name",
              value: "LMS",
            },
            {
              label: "Version",
              value: "1.0.0",
            },
            {
              label: "Environment",
              value: process.env.NODE_ENV ?? "development",
              description: "Current runtime environment",
            },
            {
              label: "API Base URL",
              value: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
              description: "Backend API endpoint",
            },
          ]}
        />

        <ConfigSection
          icon={Shield}
          title="Authentication"
          description="Security and access control settings"
          rows={[
            {
              label: "Access Token TTL",
              value: "15 minutes",
              description: "JWT access token lifetime",
            },
            {
              label: "Refresh Token TTL",
              value: "7 days",
              description: "Refresh token lifetime before re-login required",
            },
            {
              label: "Password Min Length",
              value: "8 characters",
            },
            {
              label: "Rate Limit",
              value: "100 req / min",
              description: "Per-IP rate limit for all API endpoints",
            },
          ]}
        />

        <ConfigSection
          icon={Mail}
          title="Email"
          description="Notification and transactional email settings"
          rows={[
            {
              label: "Email Provider",
              value: "Nodemailer (Ethereal)",
              description: "Development - preview URLs logged to console",
            },
            {
              label: "Enrollment Confirmation",
              value: "Enabled",
            },
            {
              label: "Course Completion",
              value: "Enabled",
            },
          ]}
        />

        <ConfigSection
          icon={Zap}
          title="Features"
          description="Active platform capabilities"
          rows={[
            {
              label: "File Uploads",
              value: "Cloudinary",
              description: "Course thumbnail storage provider",
            },
            {
              label: "Real-time Events",
              value: "Socket.io",
              description: "WebSocket notifications",
            },
            {
              label: "Enrollment Type",
              value: "Open enrollment",
              description: "Students can self-enroll in published courses",
            },
            {
              label: "Payments",
              value: "Simulated",
              description: "Price field tracked; no payment gateway",
            },
          ]}
        />
      </div>
    </div>
  );
}
