import { AlertCircle, Database, HardDrive } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { isSupabaseAvailable } from "@/lib/supabase";

interface EnvironmentStatusProps {
  showInRegistration?: boolean;
}

export const EnvironmentStatus = ({
  showInRegistration = false,
}: EnvironmentStatusProps) => {
  const supabaseConfigured = isSupabaseAvailable();

  if (!showInRegistration) return null;

  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium">Storage Mode:</span>
          {supabaseConfigured ? (
            <Badge variant="default" className="gap-1">
              <Database className="w-3 h-3" />
              Supabase Database
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <HardDrive className="w-3 h-3" />
              Local Storage (Demo Mode)
            </Badge>
          )}
        </div>
        {!supabaseConfigured && (
          <p className="text-sm text-muted-foreground">
            Running in demo mode with local storage. Data will be stored locally
            and approval status can be manually changed for testing.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
};
