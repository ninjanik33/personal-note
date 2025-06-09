import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Database, HardDrive, RefreshCw, Server, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNoteStore } from "@/store/noteStore";
import { isSupabaseAvailable } from "@/lib/supabase";
import { SupabaseConnectionTester } from "./SupabaseConnectionTester";
import { DatabaseSetupGuide } from "./DatabaseSetupGuide";
import { UserAnalytics } from "./UserAnalytics";
import { toast } from "@/hooks/use-toast";

type DataSourceMode = "localStorage" | "supabase" | "customAPI";

export const DatabaseModeSelector = () => {
  const { t } = useTranslation();
  const { useDatabase, toggleDataSource, loadData, isLoading } = useNoteStore();
  const [selectedMode, setSelectedMode] = useState<DataSourceMode>(
    useDatabase
      ? isSupabaseAvailable()
        ? "supabase"
        : "customAPI"
      : "localStorage",
  );

  const handleModeChange = async (mode: DataSourceMode) => {
    setSelectedMode(mode);

    // Check if trying to enable database modes without proper configuration
    if (mode === "supabase" && !isSupabaseAvailable()) {
      toast({
        title: "Supabase Not Configured",
        description:
          "Please configure your Supabase credentials in environment variables.",
        variant: "destructive",
      });
      return;
    }

    if (mode === "customAPI" && !import.meta.env.VITE_API_BASE_URL) {
      toast({
        title: "Custom API Not Configured",
        description:
          "Please configure VITE_API_BASE_URL in environment variables.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Toggle database mode if needed
      const shouldUseDatabase = mode !== "localStorage";
      if (shouldUseDatabase !== useDatabase) {
        toggleDataSource();
      }

      toast({
        title: "Data Source Changed",
        description: `Now using ${getDataSourceName(mode)}`,
      });
    } catch (error) {
      console.error("Error changing data source:", error);
      toast({
        title: "Error",
        description: "Failed to switch data source",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await loadData();
      toast({
        title: "Data Refreshed",
        description: "Successfully reloaded data from current source",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    }
  };

  const getDataSourceName = (mode: DataSourceMode) => {
    switch (mode) {
      case "localStorage":
        return "Local Storage";
      case "supabase":
        return "Supabase";
      case "customAPI":
        return "Custom API";
      default:
        return "Unknown";
    }
  };

  const getDataSourceIcon = (mode: DataSourceMode) => {
    switch (mode) {
      case "localStorage":
        return <HardDrive className="h-4 w-4" />;
      case "supabase":
        return <Cloud className="h-4 w-4" />;
      case "customAPI":
        return <Server className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const isAvailable = (mode: DataSourceMode): boolean => {
    switch (mode) {
      case "localStorage":
        return true;
      case "supabase":
        return isSupabaseAvailable();
      case "customAPI":
        return !!import.meta.env.VITE_API_BASE_URL;
      default:
        return false;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getDataSourceIcon(selectedMode)}
          Data Storage Configuration
        </CardTitle>
        <CardDescription>
          Choose your preferred data storage method
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="configuration" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="setup-guide">Setup Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="space-y-6 mt-6">
            <RadioGroup
              value={selectedMode}
              onValueChange={(value) =>
                handleModeChange(value as DataSourceMode)
              }
            >
              {/* Local Storage Option */}
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="localStorage" id="localStorage" />
                <div className="flex-1">
                  <Label
                    htmlFor="localStorage"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <HardDrive className="h-4 w-4 text-green-500" />
                    Local Storage
                    <Badge variant="secondary" className="text-xs">
                      Always Available
                    </Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Store data locally in your browser. Works offline but not
                    synced across devices.
                  </p>
                </div>
              </div>

              {/* Supabase Option */}
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem
                  value="supabase"
                  id="supabase"
                  disabled={!isAvailable("supabase")}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="supabase"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Cloud className="h-4 w-4 text-blue-500" />
                    Supabase
                    <Badge
                      variant={
                        isAvailable("supabase") ? "default" : "destructive"
                      }
                      className="text-xs"
                    >
                      {isAvailable("supabase")
                        ? "Configured"
                        : "Not Configured"}
                    </Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    PostgreSQL database with real-time sync. Requires Supabase
                    credentials.
                  </p>
                  {!isAvailable("supabase") && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
                    </p>
                  )}
                </div>
              </div>

              {/* Custom API Option */}
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem
                  value="customAPI"
                  id="customAPI"
                  disabled={!isAvailable("customAPI")}
                />
                <div className="flex-1">
                  <Label
                    htmlFor="customAPI"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Server className="h-4 w-4 text-purple-500" />
                    Custom API
                    <Badge
                      variant={
                        isAvailable("customAPI") ? "default" : "destructive"
                      }
                      className="text-xs"
                    >
                      {isAvailable("customAPI")
                        ? "Configured"
                        : "Not Configured"}
                    </Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your custom PostgreSQL backend API. Full control over your
                    data.
                  </p>
                  {!isAvailable("customAPI") && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Configure VITE_API_BASE_URL
                    </p>
                  )}
                </div>
              </div>
            </RadioGroup>

            {/* Current Status */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current Mode:</span>
                {getDataSourceIcon(selectedMode)}
                <span className="text-sm">
                  {getDataSourceName(selectedMode)}
                </span>
              </div>

              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>

            {/* Supabase Connection Tester */}
            {selectedMode === "supabase" && isAvailable("supabase") && (
              <div className="pt-4 border-t">
                <SupabaseConnectionTester />
              </div>
            )}

            {/* Configuration Help */}
            <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded border">
              <strong>Environment Variables:</strong>
              <br />• <code>VITE_SUPABASE_URL</code> - Your Supabase project URL
              <br />• <code>VITE_SUPABASE_ANON_KEY</code> - Your Supabase anon
              key
              <br />• <code>VITE_API_BASE_URL</code> - Your custom API base URL
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <UserAnalytics />
          </TabsContent>

          <TabsContent value="setup-guide" className="mt-6">
            <DatabaseSetupGuide />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
