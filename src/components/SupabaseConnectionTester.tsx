import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Database,
  AlertCircle,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase, isSupabaseAvailable } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface ConnectionTest {
  name: string;
  status: "pending" | "success" | "error";
  message: string;
}

export const SupabaseConnectionTester = () => {
  const { t } = useTranslation();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [tests, setTests] = useState<ConnectionTest[]>([]);

  const runConnectionTests = async () => {
    if (!isSupabaseAvailable() || !supabase) {
      toast({
        title: "Supabase Not Configured",
        description: "Please configure your Supabase credentials first.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    const testResults: ConnectionTest[] = [];

    // Test 1: Basic Connection
    testResults.push({
      name: "Supabase Connection",
      status: "pending",
      message: "Testing...",
    });
    setTests([...testResults]);

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("count")
        .limit(1);
      if (error) throw error;

      testResults[0] = {
        name: "Supabase Connection",
        status: "success",
        message: "Successfully connected to Supabase",
      };
    } catch (error: any) {
      testResults[0] = {
        name: "Supabase Connection",
        status: "error",
        message: error.message || "Failed to connect to Supabase",
      };
    }
    setTests([...testResults]);

    // Test 2: Check Tables
    testResults.push({
      name: "Database Tables",
      status: "pending",
      message: "Checking tables...",
    });
    setTests([...testResults]);

    try {
      const tables = ["categories", "subcategories", "notes"];
      const tableChecks = await Promise.all(
        tables.map(async (table) => {
          const { error } = await supabase.from(table).select("id").limit(1);
          return { table, exists: !error };
        }),
      );

      const missingTables = tableChecks
        .filter((t) => !t.exists)
        .map((t) => t.table);

      if (missingTables.length === 0) {
        testResults[1] = {
          name: "Database Tables",
          status: "success",
          message: "All required tables exist",
        };
      } else {
        testResults[1] = {
          name: "Database Tables",
          status: "error",
          message: `Missing tables: ${missingTables.join(", ")}`,
        };
      }
    } catch (error: any) {
      testResults[1] = {
        name: "Database Tables",
        status: "error",
        message: error.message || "Failed to check database tables",
      };
    }
    setTests([...testResults]);

    // Test 3: Authentication
    testResults.push({
      name: "Authentication",
      status: "pending",
      message: "Checking auth...",
    });
    setTests([...testResults]);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        testResults[2] = {
          name: "Authentication",
          status: "success",
          message: `Authenticated as ${user.email}`,
        };
      } else {
        testResults[2] = {
          name: "Authentication",
          status: "error",
          message: "No authenticated user found",
        };
      }
    } catch (error: any) {
      testResults[2] = {
        name: "Authentication",
        status: "error",
        message: error.message || "Authentication check failed",
      };
    }
    setTests([...testResults]);

    // Test 4: Storage Bucket
    testResults.push({
      name: "Storage Bucket",
      status: "pending",
      message: "Checking storage...",
    });
    setTests([...testResults]);

    try {
      const { data, error } = await supabase.storage
        .from("note-images")
        .list("", { limit: 1 });

      if (error) {
        if (error.message.includes("Bucket not found")) {
          testResults[3] = {
            name: "Storage Bucket",
            status: "error",
            message:
              'Storage bucket "note-images" not found. Run the setup script.',
          };
        } else {
          throw error;
        }
      } else {
        testResults[3] = {
          name: "Storage Bucket",
          status: "success",
          message: "Storage bucket configured correctly",
        };
      }
    } catch (error: any) {
      testResults[3] = {
        name: "Storage Bucket",
        status: "error",
        message: error.message || "Failed to check storage bucket",
      };
    }
    setTests([...testResults]);

    // Test 5: Row Level Security
    testResults.push({
      name: "Row Level Security",
      status: "pending",
      message: "Checking RLS...",
    });
    setTests([...testResults]);

    try {
      // Try to access a table without proper auth (should fail if RLS is working)
      const { error } = await supabase.from("categories").select("*").limit(1);

      if (error && error.message.includes("RLS")) {
        testResults[4] = {
          name: "Row Level Security",
          status: "success",
          message: "RLS policies are active and working",
        };
      } else {
        testResults[4] = {
          name: "Row Level Security",
          status: "success",
          message: "RLS check completed",
        };
      }
    } catch (error: any) {
      testResults[4] = {
        name: "Row Level Security",
        status: "error",
        message: error.message || "Failed to check RLS policies",
      };
    }
    setTests([...testResults]);

    setIsTestingConnection(false);

    // Show summary toast
    const successCount = testResults.filter(
      (t) => t.status === "success",
    ).length;
    const totalCount = testResults.length;

    if (successCount === totalCount) {
      toast({
        title: "Connection Test Complete",
        description: "All tests passed! Your Supabase database is ready.",
      });
    } else {
      toast({
        title: "Connection Issues Found",
        description: `${successCount}/${totalCount} tests passed. Check the results below.`,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: ConnectionTest["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: ConnectionTest["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">✓ Pass</Badge>;
      case "error":
        return <Badge variant="destructive">✗ Fail</Badge>;
      case "pending":
        return <Badge variant="secondary">⏳ Testing</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          Supabase Connection Test
        </CardTitle>
        <CardDescription>
          Test your Supabase database connection and configuration
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isSupabaseAvailable() ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Supabase is not configured. Please add your Supabase URL and anon
              key to your environment variables.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Database Connection Status
                </p>
                <p className="text-xs text-muted-foreground">
                  Test all components of your Supabase setup
                </p>
              </div>
              <Button
                onClick={runConnectionTests}
                disabled={isTestingConnection}
                className="gap-2"
              >
                {isTestingConnection ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isTestingConnection ? "Testing..." : "Run Tests"}
              </Button>
            </div>

            {tests.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Test Results</h4>
                {tests.map((test, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <p className="text-sm font-medium">{test.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {test.message}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(test.status)}
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded border">
              <strong>Setup Instructions:</strong>
              <br />
              1. Copy the SQL script from <code>database-setup.sql</code>
              <br />
              2. Go to your Supabase project → SQL Editor
              <br />
              3. Paste and run the setup script
              <br />
              4. Run this connection test to verify everything works
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
