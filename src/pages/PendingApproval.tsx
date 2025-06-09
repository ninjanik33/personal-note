import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuthStore } from "@/store/authStore";

const PendingApproval = () => {
  const { logout } = useAuthStore();

  useEffect(() => {
    // Automatically logout user since they can't use the app yet
    logout();
  }, [logout]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Language Switcher */}
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>

        {/* Pending Approval Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Account Pending
              </CardTitle>
              <CardDescription className="mt-2">
                Your registration is under review
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge variant="secondary" className="gap-2">
                <Clock className="w-3 h-3" />
                Pending Approval
              </Badge>
            </div>

            {/* Main Message */}
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Registration Successful!</strong> Your account has been
                created and is now waiting for administrator approval.
              </AlertDescription>
            </Alert>

            {/* Information Cards */}
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email Notification</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You'll receive an email notification once your account is
                      approved.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium">What happens next?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Our administrators will review your application. This
                      process typically takes 1-2 business days.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Check Status</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You can return to this page anytime to check your approval
                      status.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Important:</strong> Please keep this page bookmarked and
                check back later.
              </p>
              <p>If you have any questions, please contact our support team.</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleRefresh}
                className="w-full gap-2"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4" />
                Check Status Again
              </Button>

              <Button asChild className="w-full" variant="secondary">
                <Link to="/login">Back to Login</Link>
              </Button>
            </div>

            {/* Contact Information */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Need help?{" "}
                <a
                  href="mailto:support@notesapp.com"
                  className="text-primary hover:underline"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Personal Notes App. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
