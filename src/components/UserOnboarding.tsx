import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle,
  FolderPlus,
  FileText,
  Tag,
  ImageIcon,
  Settings,
  ArrowRight,
  Sparkles,
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
import { useNoteStore } from "@/store/noteStore";
import { useAppStore } from "@/store/appStore";
import { toast } from "@/hooks/use-toast";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: () => void;
  actionText?: string;
  completed: boolean;
}

export const UserOnboarding = () => {
  const { t } = useTranslation();
  const { categories, notes, createCategory, createSubcategory, createNote } =
    useNoteStore();
  const { setSelectedCategory, setSelectedSubcategory } = useAppStore();
  const [isCreatingExamples, setIsCreatingExamples] = useState(false);

  const createExampleContent = async () => {
    setIsCreatingExamples(true);

    try {
      // Create example category
      await createCategory({
        name: "Getting Started",
        color: "#3b82f6",
      });

      // Wait a bit for the category to be created
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Find the created category
      const createdCategory = categories.find(
        (cat) => cat.name === "Getting Started",
      );
      if (createdCategory) {
        // Create example subcategory
        await createSubcategory({
          name: "Welcome Notes",
          categoryId: createdCategory.id,
        });

        // Wait a bit for the subcategory to be created
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Find the created subcategory
        const createdSubcategory = createdCategory.subcategories.find(
          (sub) => sub.name === "Welcome Notes",
        );
        if (createdSubcategory) {
          // Create example note
          await createNote({
            title: "Welcome to Personal Notes!",
            content: `<h2>🎉 Welcome to your personal note-taking app!</h2>
            
            <p>This is your first note. Here are some things you can do:</p>
            
            <ul>
              <li><strong>Rich Text Editing</strong> - Format your text with bold, italic, lists, and more</li>
              <li><strong>Add Images</strong> - Upload and embed images in your notes</li>
              <li><strong>Organize with Tags</strong> - Tag your notes for easy searching</li>
              <li><strong>Categories & Subcategories</strong> - Keep everything organized</li>
            </ul>
            
            <blockquote>
              <p>💡 <em>Tip: Try editing this note to get familiar with the rich text editor!</em></p>
            </blockquote>
            
            <p>Happy note-taking! 📝</p>`,
            subcategoryId: createdSubcategory.id,
            tags: ["welcome", "tutorial", "getting-started"],
          });

          // Navigate to the created content
          setSelectedCategory(createdCategory.id);
          setSelectedSubcategory(createdSubcategory.id);

          toast({
            title: "Example Content Created!",
            description:
              "Check out your first category, subcategory, and note.",
          });
        }
      }
    } catch (error) {
      console.error("Error creating example content:", error);
      toast({
        title: "Error",
        description: "Failed to create example content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingExamples(false);
    }
  };

  const steps: OnboardingStep[] = [
    {
      id: "create-category",
      title: "Create Your First Category",
      description:
        'Organize your notes by creating categories like "Work", "Personal", or "Projects".',
      icon: <FolderPlus className="h-5 w-5 text-blue-500" />,
      completed: categories.length > 0,
      action: createExampleContent,
      actionText: "Create Example",
    },
    {
      id: "create-subcategory",
      title: "Add Subcategories",
      description:
        "Break down categories into smaller subcategories for better organization.",
      icon: <FolderPlus className="h-5 w-5 text-green-500" />,
      completed: categories.some((cat) => cat.subcategories.length > 0),
    },
    {
      id: "create-note",
      title: "Write Your First Note",
      description:
        "Start writing! Use the rich text editor to format your content.",
      icon: <FileText className="h-5 w-5 text-purple-500" />,
      completed: notes.length > 0,
    },
    {
      id: "add-tags",
      title: "Use Tags",
      description:
        "Add tags to your notes to make them easier to find and organize.",
      icon: <Tag className="h-5 w-5 text-orange-500" />,
      completed: notes.some((note) => note.tags.length > 0),
    },
    {
      id: "add-images",
      title: "Upload Images",
      description: "Enhance your notes by adding images and visual content.",
      icon: <ImageIcon className="h-5 w-5 text-pink-500" />,
      completed: notes.some((note) => note.images.length > 0),
    },
    {
      id: "explore-settings",
      title: "Explore Settings",
      description:
        "Check out the settings to configure your app and data storage options.",
      icon: <Settings className="h-5 w-5 text-gray-500" />,
      completed: false, // This is always available
    },
  ];

  const completedSteps = steps.filter((step) => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  // Don't show onboarding if user has significant content
  if (categories.length >= 3 || notes.length >= 5) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Welcome to Personal Notes!
          </CardTitle>
          <CardDescription>
            Let's get you started with your personal note-taking workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <Badge variant="secondary">
                {completedSteps}/{totalSteps} Complete
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Complete these steps to get the most out of your note-taking app.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <Card
            key={step.id}
            className={`transition-all duration-200 ${
              step.completed
                ? "border-green-200 bg-green-50/50"
                : "hover:shadow-md cursor-pointer"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-500">
                        {index + 1}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {step.icon}
                    <h3
                      className={`font-medium ${step.completed ? "text-green-700" : ""}`}
                    >
                      {step.title}
                    </h3>
                    {step.completed && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-700"
                      >
                        ✓ Done
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {step.action && !step.completed && (
                  <Button
                    onClick={step.action}
                    disabled={isCreatingExamples}
                    size="sm"
                    className="gap-2"
                  >
                    {step.actionText}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {completedSteps === totalSteps && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            🎉 Congratulations! You've completed the onboarding. You're ready to
            start taking notes like a pro!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
