import { Category, Note } from "@/types/note";

export const createSampleData = () => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const categories: Category[] = [
    {
      id: "cat_work",
      name: "Work",
      color: "#3b82f6",
      createdAt: lastWeek,
      subcategories: [
        {
          id: "sub_meetings",
          name: "Meetings",
          categoryId: "cat_work",
          createdAt: lastWeek,
        },
        {
          id: "sub_projects",
          name: "Projects",
          categoryId: "cat_work",
          createdAt: lastWeek,
        },
      ],
    },
    {
      id: "cat_personal",
      name: "Personal",
      color: "#10b981",
      createdAt: lastWeek,
      subcategories: [
        {
          id: "sub_ideas",
          name: "Ideas",
          categoryId: "cat_personal",
          createdAt: lastWeek,
        },
        {
          id: "sub_journal",
          name: "Journal",
          categoryId: "cat_personal",
          createdAt: lastWeek,
        },
      ],
    },
    {
      id: "cat_learning",
      name: "Learning",
      color: "#f59e0b",
      createdAt: lastWeek,
      subcategories: [
        {
          id: "sub_tutorials",
          name: "Tutorials",
          categoryId: "cat_learning",
          createdAt: lastWeek,
        },
        {
          id: "sub_resources",
          name: "Resources",
          categoryId: "cat_learning",
          createdAt: lastWeek,
        },
      ],
    },
  ];

  const notes: Note[] = [
    {
      id: "note_1",
      title: "Project Planning Meeting",
      content:
        "<h2>Meeting Notes</h2><p>Discussed the new project timeline and deliverables.</p><ul><li>Phase 1: Research and planning</li><li>Phase 2: Design and development</li><li>Phase 3: Testing and deployment</li></ul><p><strong>Next steps:</strong> Create detailed project roadmap by Friday.</p>",
      subcategoryId: "sub_meetings",
      tags: ["planning", "project", "deadline"],
      images: [],
      createdAt: yesterday,
      updatedAt: yesterday,
    },
    {
      id: "note_2",
      title: "App Ideas",
      content:
        "<h2>Mobile App Concepts</h2><p>Brainstorming session for new mobile app ideas:</p><ul><li><strong>Recipe Manager:</strong> Organize and share cooking recipes</li><li><strong>Habit Tracker:</strong> Track daily habits and goals</li><li><strong>Photo Journal:</strong> Visual diary with location tracking</li></ul><blockquote>Remember to focus on user experience and simplicity.</blockquote>",
      subcategoryId: "sub_ideas",
      tags: ["mobile", "apps", "brainstorming"],
      images: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "note_3",
      title: "React Best Practices",
      content:
        "<h2>React Development Guidelines</h2><p>Key principles to follow when building React applications:</p><ul><li>Use functional components with hooks</li><li>Implement proper error boundaries</li><li>Optimize with React.memo and useMemo</li><li>Follow consistent naming conventions</li></ul><p><em>Resources:</em> Check React documentation for latest updates.</p>",
      subcategoryId: "sub_tutorials",
      tags: ["react", "javascript", "development", "best-practices"],
      images: [],
      createdAt: lastWeek,
      updatedAt: yesterday,
    },
    {
      id: "note_4",
      title: "Daily Reflection",
      content:
        "<h2>Today's Thoughts</h2><p>Productive day working on the note-taking app. Made good progress on the rich text editor and image upload functionality.</p><p><strong>What went well:</strong></p><ul><li>Completed the editor integration</li><li>Fixed several UI bugs</li><li>Added multi-language support</li></ul><p><strong>Tomorrow's goals:</strong></p><ul><li>Improve mobile responsiveness</li><li>Add search functionality</li><li>Test image storage</li></ul>",
      subcategoryId: "sub_journal",
      tags: ["reflection", "progress", "goals"],
      images: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "note_5",
      title: "Useful Development Resources",
      content:
        '<h2>Web Development Resources</h2><p>Collection of helpful tools and websites:</p><ul><li><a href="https://developer.mozilla.org/">MDN Web Docs</a> - Comprehensive web documentation</li><li><a href="https://tailwindcss.com/">Tailwind CSS</a> - Utility-first CSS framework</li><li><a href="https://react.dev/">React Documentation</a> - Official React guides</li><li><a href="https://www.typescriptlang.org/">TypeScript</a> - Typed JavaScript</li></ul><p><strong>Design Tools:</strong></p><ul><li>Figma for UI design</li><li>Unsplash for free photos</li><li>Lucide for icons</li></ul>',
      subcategoryId: "sub_resources",
      tags: ["resources", "tools", "development", "design"],
      images: [],
      createdAt: lastWeek,
      updatedAt: lastWeek,
    },
  ];

  return { categories, notes };
};
