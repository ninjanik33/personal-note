import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/store/appStore";

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
] as const;

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const { setLanguage } = useAppStore();

  const handleLanguageChange = (languageCode: "en" | "th" | "zh") => {
    i18n.changeLanguage(languageCode);
    setLanguage(languageCode);
  };

  const currentLanguage = languages.find((lang) => lang.code === i18n.language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLanguage?.nativeName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={i18n.language === language.code ? "bg-accent" : ""}
          >
            <span className="font-medium">{language.nativeName}</span>
            <span className="ml-2 text-muted-foreground">
              ({language.name})
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
