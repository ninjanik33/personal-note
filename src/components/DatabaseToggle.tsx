import { useTranslation } from "react-i18next";
import { Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNoteStore } from "@/store/noteStore";
import { toast } from "@/hooks/use-toast";

export const DatabaseToggle = () => {
  const { t } = useTranslation();
  const { loadData, isLoading } = useNoteStore();

  const handleRefresh = async () => {
    try {
      await loadData();
      toast({
        title: "Data Refreshed",
        description: "Successfully reloaded data from Supabase",
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
          <Database className="h-5 w-5 text-blue-500" />
          Data Storage
        </CardTitle>
        <CardDescription>
          Using Supabase cloud database for data storage
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center gap-2">
              External Database
              <Badge variant="default" className="text-xs">
                Supabase
              </Badge>
            </div>
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
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              🌐 Supabase Database
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              Data is stored in Supabase and synced across devices. Requires
              internet connection and user authentication.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
