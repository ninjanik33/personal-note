import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { useNoteStore } from "@/store/noteStore";
import { useAppStore } from "@/store/appStore";
import { Category, Subcategory } from "@/types/note";

const predefinedColors = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#64748b",
  "#6b7280",
  "#374151",
];

interface CategoryFormProps {
  category?: Category;
  onSave: (name: string, color: string) => void;
  onCancel: () => void;
}

const CategoryForm = ({ category, onSave, onCancel }: CategoryFormProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState(category?.name || "");
  const [color, setColor] = useState(category?.color || predefinedColors[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), color);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category-name">{t("category.name")}</Label>
        <Input
          id="category-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("category.name")}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>{t("category.color")}</Label>
        <div className="grid grid-cols-10 gap-2">
          {predefinedColors.map((colorOption) => (
            <button
              key={colorOption}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                color === colorOption ? "border-gray-900" : "border-gray-300"
              }`}
              style={{ backgroundColor: colorOption }}
              onClick={() => setColor(colorOption)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          {category ? t("common.save") : t("common.create")}
        </Button>
      </div>
    </form>
  );
};

interface SubcategoryFormProps {
  subcategory?: Subcategory;
  categoryId: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

const SubcategoryForm = ({
  subcategory,
  onSave,
  onCancel,
}: SubcategoryFormProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState(subcategory?.name || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subcategory-name">{t("subcategory.name")}</Label>
        <Input
          id="subcategory-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("subcategory.name")}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          {subcategory ? t("common.save") : t("common.create")}
        </Button>
      </div>
    </form>
  );
};

export const CategoryManager = () => {
  const { t } = useTranslation();
  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
  } = useNoteStore();
  const { selectedCategoryId, setSelectedCategory } = useAppStore();

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showSubcategoryDialog, setShowSubcategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [deletingSubcategory, setDeletingSubcategory] =
    useState<Subcategory | null>(null);
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] =
    useState<string>("");

  const handleCreateCategory = (name: string, color: string) => {
    createCategory({ name, color });
    setShowCategoryDialog(false);
    toast({
      title: t("common.success"),
      description: "Category created successfully",
    });
  };

  const handleUpdateCategory = (name: string, color: string) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, { name, color });
      setEditingCategory(null);
      toast({
        title: t("common.success"),
        description: "Category updated successfully",
      });
    }
  };

  const handleDeleteCategory = () => {
    if (deletingCategory) {
      deleteCategory(deletingCategory.id);
      if (selectedCategoryId === deletingCategory.id) {
        setSelectedCategory(null);
      }
      setDeletingCategory(null);
      toast({
        title: t("common.success"),
        description: "Category deleted successfully",
      });
    }
  };

  const handleCreateSubcategory = (name: string) => {
    createSubcategory({ name, categoryId: selectedCategoryForSubcategory });
    setShowSubcategoryDialog(false);
    setSelectedCategoryForSubcategory("");
    toast({
      title: t("common.success"),
      description: "Subcategory created successfully",
    });
  };

  const handleUpdateSubcategory = (name: string) => {
    if (editingSubcategory) {
      updateSubcategory(editingSubcategory.id, { name });
      setEditingSubcategory(null);
      toast({
        title: t("common.success"),
        description: "Subcategory updated successfully",
      });
    }
  };

  const handleDeleteSubcategory = () => {
    if (deletingSubcategory) {
      deleteSubcategory(deletingSubcategory.id);
      setDeletingSubcategory(null);
      toast({
        title: t("common.success"),
        description: "Subcategory deleted successfully",
      });
    }
  };

  const openSubcategoryDialog = (categoryId: string) => {
    setSelectedCategoryForSubcategory(categoryId);
    setShowSubcategoryDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("sidebar.categories")}</h3>
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              {t("sidebar.newCategory")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("category.create")}</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSave={handleCreateCategory}
              onCancel={() => setShowCategoryDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="space-y-1">
            <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent/50 group">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium">{category.name}</span>
                <span className="text-sm text-muted-foreground">
                  ({category.subcategories.length})
                </span>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => openSubcategoryDialog(category.id)}
                >
                  <FolderPlus className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setEditingCategory(category)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  onClick={() => setDeletingCategory(category)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Subcategories */}
            {category.subcategories.map((subcategory) => (
              <div
                key={subcategory.id}
                className="ml-6 flex items-center justify-between p-2 rounded-lg border hover:bg-accent/50 group"
              >
                <span className="text-sm">{subcategory.name}</span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => setEditingSubcategory(subcategory)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={() => setDeletingSubcategory(subcategory)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Edit Category Dialog */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={() => setEditingCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("category.edit")}</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm
              category={editingCategory}
              onSave={handleUpdateCategory}
              onCancel={() => setEditingCategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Subcategory Dialog */}
      <Dialog
        open={showSubcategoryDialog}
        onOpenChange={setShowSubcategoryDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("subcategory.create")}</DialogTitle>
          </DialogHeader>
          <SubcategoryForm
            categoryId={selectedCategoryForSubcategory}
            onSave={handleCreateSubcategory}
            onCancel={() => {
              setShowSubcategoryDialog(false);
              setSelectedCategoryForSubcategory("");
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog
        open={!!editingSubcategory}
        onOpenChange={() => setEditingSubcategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("subcategory.edit")}</DialogTitle>
          </DialogHeader>
          {editingSubcategory && (
            <SubcategoryForm
              subcategory={editingSubcategory}
              categoryId={editingSubcategory.categoryId}
              onSave={handleUpdateSubcategory}
              onCancel={() => setEditingSubcategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Category Alert */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("category.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("category.confirmDelete")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Subcategory Alert */}
      <AlertDialog
        open={!!deletingSubcategory}
        onOpenChange={() => setDeletingSubcategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("subcategory.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("subcategory.confirmDelete")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubcategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
