import { useState } from "react";
import {
  Copy,
  ExternalLink,
  CheckCircle,
  Database,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

export const DatabaseSetupGuide = () => {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const copyToClipboard = async (text: string, stepId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStep(stepId);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
      setTimeout(() => setCopiedStep(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the content manually",
        variant: "destructive",
      });
    }
  };

  const envTemplate = `# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`;

  const setupSteps = [
    {
      id: "create-project",
      title: "Create Supabase Project",
      description: "Set up your Supabase project",
      content: (
        <div className="space-y-3">
          <p className="text-sm">
            1. Go to{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener"
              className="text-blue-500 hover:underline"
            >
              supabase.com
            </a>
          </p>
          <p className="text-sm">2. Click "Start your project" and sign in</p>
          <p className="text-sm">3. Create a new project</p>
          <p className="text-sm">
            4. Wait for the project to be ready (2-3 minutes)
          </p>
        </div>
      ),
    },
    {
      id: "get-credentials",
      title: "Get Project Credentials",
      description: "Copy your project URL and API key",
      content: (
        <div className="space-y-3">
          <p className="text-sm">
            1. Go to Settings → API in your Supabase dashboard
          </p>
          <p className="text-sm">
            2. Copy the <strong>Project URL</strong>
          </p>
          <p className="text-sm">
            3. Copy the <strong>anon/public key</strong>
          </p>
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              You'll find these under "Project Settings" → "API" in your
              Supabase dashboard
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
    {
      id: "setup-env",
      title: "Configure Environment Variables",
      description: "Add credentials to your app",
      content: (
        <div className="space-y-3">
          <p className="text-sm">
            Create a <code>.env</code> file in your project root:
          </p>
          <div className="relative">
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
              {envTemplate}
            </pre>
            <Button
              onClick={() => copyToClipboard(envTemplate, "env")}
              size="sm"
              variant="outline"
              className="absolute top-2 right-2 h-6 w-6 p-0"
            >
              {copiedStep === "env" ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Replace the placeholder values with your actual Supabase credentials
          </p>
        </div>
      ),
    },
    {
      id: "run-sql",
      title: "Set Up Database",
      description: "Create tables and configure security",
      content: (
        <div className="space-y-3">
          <p className="text-sm">
            1. Copy the SQL setup script from <code>database-setup.sql</code>
          </p>
          <p className="text-sm">
            2. Go to SQL Editor in your Supabase dashboard
          </p>
          <p className="text-sm">3. Paste and run the entire script</p>
          <div className="flex gap-2">
            <Button
              onClick={() => window.open("/database-setup.sql", "_blank")}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <ExternalLink className="h-3 w-3" />
              View SQL Script
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: "test-connection",
      title: "Test Connection",
      description: "Verify everything is working",
      content: (
        <div className="space-y-3">
          <p className="text-sm">1. Restart your development server</p>
          <p className="text-sm">2. Open Settings in the app</p>
          <p className="text-sm">3. Select "Supabase" mode</p>
          <p className="text-sm">4. Run the connection test</p>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              If all tests pass, you're ready to use the app with Supabase!
            </AlertDescription>
          </Alert>
        </div>
      ),
    },
  ];

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          Supabase Database Setup Guide
        </CardTitle>
        <CardDescription>
          Complete step-by-step guide to set up your Supabase database
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="steps" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="steps">Setup Steps</TabsTrigger>
            <TabsTrigger value="sql">SQL Script</TabsTrigger>
          </TabsList>

          <TabsContent value="steps" className="space-y-4">
            {setupSteps.map((step, index) => (
              <Card key={step.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      {index + 1}
                    </Badge>
                    <div>
                      <CardTitle className="text-base">{step.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {step.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">{step.content}</CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="sql" className="space-y-4">
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                This SQL script will create all necessary tables, indexes, and
                security policies for your notes app.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Database Setup Script</h4>
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.open("/database-setup.sql", "_blank")}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open in New Tab
                  </Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>What this script creates:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Tables: categories, subcategories, notes</li>
                  <li>Row Level Security (RLS) policies</li>
                  <li>Performance indexes</li>
                  <li>Storage bucket for images</li>
                  <li>Auto-update triggers</li>
                  <li>Helpful database views</li>
                </ul>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Important:</strong> Copy the entire SQL script from
                  the file and run it in your Supabase SQL Editor. The script is
                  idempotent, so it's safe to run multiple times.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
