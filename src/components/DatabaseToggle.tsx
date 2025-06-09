import { useTranslation } from "react-i18next";
import { Database, HardDrive, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNoteStore } from "@/store/noteStore";
import { isSupabaseAvailable } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export const DatabaseToggle = () => {
  const { t } = useTranslation();
  const { useDatabase, toggleDataSource, loadData, isLoading } = useNoteStore();

  const handleToggle = async () => {
    // Check if trying to enable database mode without proper configuration
    if (!useDatabase && !isSupabaseAvailable()) {
      toast({
        title: "Database Not Configured",
        description:
          "Please configure your database connection or use custom API mode.",
        variant: "destructive",
      });
      return;
    }

    try {
      toggleDataSource();
      toast({
        title: "Data Source Changed",
        description: `Now using ${!useDatabase ? "external database" : "local storage"}`,
      });
    } catch (error) {
      console.error("Error toggling data source:", error);
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {useDatabase ? (
            <Database className="h-5 w-5 text-blue-500" />
          ) : (
            <HardDrive className="h-5 w-5 text-green-500" />
          )}
          Data Storage
        </CardTitle>
        <CardDescription>
          Choose between local storage and external database
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="database-toggle"
              checked={useDatabase}
              onCheckedChange={handleToggle}
              disabled={isLoading}
            />
            <Label
              htmlFor="database-toggle"
              className="flex items-center gap-2"
            >
              {useDatabase ? "External Database" : "Local Storage"}
              <Badge
                variant={useDatabase ? "default" : "secondary"}
                className="text-xs"
              >
                {useDatabase ? "Cloud" : "Local"}
              </Badge>
            </Label>
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

        <div className="text-sm text-muted-foreground space-y-2">
          {useDatabase ? (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                🌐 External Database Mode
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                Data is stored in Supabase and synced across devices. Requires
                internet connection.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-medium text-green-900 dark:text-green-100">
                💾 Local Storage Mode
              </p>
              <p className="text-green-700 dark:text-green-300">
                Data is stored locally in your browser. Works offline but not
                synced across devices.
              </p>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-2">
          {!isSupabaseAvailable() && (
            <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
              <strong className="text-yellow-900 dark:text-yellow-100">
                ⚠️ Database Not Configured
              </strong>
              <br />
              <span className="text-yellow-700 dark:text-yellow-300">
                To use external database mode, configure:
                <br />• <code>VITE_SUPABASE_URL</code> (for Supabase)
                <br />• <code>VITE_SUPABASE_ANON_KEY</code> (for Supabase)
                <br />
                OR
                <br />• <code>VITE_API_BASE_URL</code> (for custom API)
              </span>
            </div>
          )}

          {useDatabase && isSupabaseAvailable() && (
            <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
              <strong className="text-green-900 dark:text-green-100">
                ✅ Supabase Connected
              </strong>
              <br />
              <span className="text-green-700 dark:text-green-300">
                Using Supabase for data storage.
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
