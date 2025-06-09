import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  FileText,
  Folder,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";
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
import { supabase, isSupabaseAvailable } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

interface UserStats {
  totalNotes: number;
  totalCategories: number;
  totalSubcategories: number;
  totalTags: number;
  accountAge: number;
  lastActivity: Date | null;
  storageUsed: number;
}

interface AppStats {
  totalUsers: number;
  activeUsers: number;
  totalNotesGlobal: number;
  avgNotesPerUser: number;
}

export const UserAnalytics = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [appStats, setAppStats] = useState<AppStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isSupabaseAvailable() && user) {
      loadUserStats();
      loadAppStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    if (!supabase || !user) return;

    setIsLoading(true);
    try {
      // Get user's content statistics
      const [notesResult, categoriesResult, subcategoriesResult] =
        await Promise.all([
          supabase
            .from("notes")
            .select("content, tags, created_at")
            .eq("user_id", user.id),
          supabase.from("categories").select("id").eq("user_id", user.id),
          supabase.from("subcategories").select("id").eq("user_id", user.id),
        ]);

      const notes = notesResult.data || [];
      const categories = categoriesResult.data || [];
      const subcategories = subcategoriesResult.data || [];

      // Calculate unique tags
      const allTags = notes.flatMap((note) => note.tags || []);
      const uniqueTags = new Set(allTags);

      // Calculate storage usage (approximate)
      const storageUsed = notes.reduce((total, note) => {
        return total + (note.content?.length || 0);
      }, 0);

      // Get account age
      const { data: userData } = await supabase.auth.getUser();
      const accountAge = userData.user?.created_at
        ? Math.floor(
            (Date.now() - new Date(userData.user.created_at).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 0;

      // Get last activity (most recent note update)
      const lastActivity =
        notes.length > 0
          ? new Date(
              Math.max(
                ...notes.map((note) => new Date(note.created_at).getTime()),
              ),
            )
          : null;

      setUserStats({
        totalNotes: notes.length,
        totalCategories: categories.length,
        totalSubcategories: subcategories.length,
        totalTags: uniqueTags.size,
        accountAge,
        lastActivity,
        storageUsed,
      });
    } catch (error) {
      console.error("Error loading user stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAppStats = async () => {
    if (!supabase) return;

    try {
      // Note: These queries might not work due to RLS policies
      // In a real admin dashboard, you'd need special admin permissions

      // Try to get global stats (will only work for admin users)
      const { data: globalNotes, error } = await supabase
        .from("notes")
        .select("user_id");

      if (!error && globalNotes) {
        const totalNotesGlobal = globalNotes.length;
        const uniqueUsers = new Set(globalNotes.map((note) => note.user_id));
        const totalUsers = uniqueUsers.size;

        setAppStats({
          totalUsers,
          activeUsers: totalUsers, // Simplified for demo
          totalNotesGlobal,
          avgNotesPerUser:
            totalUsers > 0 ? Math.round(totalNotesGlobal / totalUsers) : 0,
        });
        setIsAdmin(true);
      }
    } catch (error) {
      // User doesn't have admin permissions, which is expected
      console.log("Admin stats not available (normal for regular users)");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (!isSupabaseAvailable()) {
    return (
      <Alert>
        <BarChart3 className="h-4 w-4" />
        <AlertDescription>
          Analytics are only available when using Supabase database mode.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue-500" />
        <h2 className="text-xl font-semibold">Usage Analytics</h2>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Personal Stats</TabsTrigger>
          <TabsTrigger value="global" disabled={!isAdmin}>
            Global Stats {!isAdmin && "(Admin Only)"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          {userStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Notes
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userStats.totalNotes}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Categories
                  </CardTitle>
                  <Folder className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userStats.totalCategories}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {userStats.totalSubcategories} subcategories
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Unique Tags
                  </CardTitle>
                  <Badge className="h-4 w-4 rounded-full p-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userStats.totalTags}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Account Age
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userStats.accountAge}
                  </div>
                  <p className="text-xs text-muted-foreground">days</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Content Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Storage Used:</span>
                  <span className="text-sm font-medium">
                    {userStats ? formatBytes(userStats.storageUsed) : "0 Bytes"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg. Notes per Category:</span>
                  <span className="text-sm font-medium">
                    {userStats && userStats.totalCategories > 0
                      ? Math.round(
                          userStats.totalNotes / userStats.totalCategories,
                        )
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Avg. Tags per Note:</span>
                  <span className="text-sm font-medium">
                    {userStats && userStats.totalNotes > 0
                      ? Math.round(
                          (userStats.totalTags / userStats.totalNotes) * 10,
                        ) / 10
                      : 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Activity Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Last Activity:</span>
                  <span className="text-sm font-medium">
                    {userStats?.lastActivity
                      ? formatDate(userStats.lastActivity)
                      : "Never"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Account Type:</span>
                  <Badge variant="secondary" className="text-xs">
                    {isAdmin ? "Admin" : "User"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Data Source:</span>
                  <Badge variant="outline" className="text-xs">
                    Supabase
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="global" className="space-y-4">
          {isAdmin && appStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appStats.totalUsers}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Users
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appStats.activeUsers}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Notes
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appStats.totalNotesGlobal}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. Notes/User
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {appStats.avgNotesPerUser}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Global statistics are only available to admin users. Regular
                users can only see their personal statistics.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
