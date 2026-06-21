const fs = require('fs');

function replaceInFile(path, replacements) {
  let content = fs.readFileSync(path, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(path, content);
}

// 1. SettingsPanel.tsx
replaceInFile('components/reader/SettingsPanel.tsx', [
  [
    `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';`,
    `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';\nimport { toast } from "sonner";`
  ],
  [
    `setTheme(value as Theme);`,
    `setTheme(value as Theme);\n    toast("Theme updated to " + value);`
  ],
  [
    `setSetting('fontFamily', value);`,
    `setSetting('fontFamily', value);\n    toast("Font family updated");`
  ],
  [
    `setSetting('fontSize', value);`,
    `setSetting('fontSize', value);\n    toast("Font size updated");`
  ]
]);

// 2. BookmarkPanel.tsx
replaceInFile('components/reader/BookmarkPanel.tsx', [
  [
    `import { Bookmark as BookmarkIcon, X, Trash2, ArrowRight } from 'lucide-react';`,
    `import { Bookmark as BookmarkIcon, X, Trash2, ArrowRight } from 'lucide-react';\nimport { toast } from "sonner";`
  ],
  [
    `onClick={() => bookmark.id && removeBookmark(bookmark.id)}`,
    `onClick={() => {\n                      if (bookmark.id) {\n                        removeBookmark(bookmark.id);\n                        toast("Bookmark removed");\n                      }\n                    }}`
  ]
]);

// 3. HighlightManager.tsx
replaceInFile('components/reader/HighlightManager.tsx', [
  [
    `import { useHighlights } from '@/lib/db-hooks';`,
    `import { useHighlights } from '@/lib/db-hooks';\nimport { toast } from "sonner";`
  ],
  [
    `setShowToolbar(false);\n  };`,
    `setShowToolbar(false);\n    toast("Highlight added");\n  };`
  ]
]);

console.log("Replacements done");
