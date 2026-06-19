'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/lib/db-hooks';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function SettingsPanel() {
  const { settings, setSetting } = useSettings();

  const handleThemeChange = (value: string) => {
    setSetting('theme', value);
    // Since next-themes manages the theme, we also need to update its state or document class
    // For now, let's assume we rely on next-themes and this just syncs to db
    if (value === 'system') {
      document.documentElement.classList.remove('dark');
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    } else if (value === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleFontFamilyChange = (value: string) => {
    setSetting('fontFamily', value);
    document.documentElement.style.setProperty('--font-family', value === 'serif' ? 'ui-serif, Georgia, serif' : 'ui-sans-serif, system-ui, sans-serif');
  };

  const handleFontSizeChange = (value: string) => {
    setSetting('fontSize', value);
    document.documentElement.style.setProperty('--font-size-multiplier', value);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Reader Settings</SheetTitle>
        </SheetHeader>
        <div className="py-6 space-y-6">
          
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={(settings.theme as string) || 'system'} onValueChange={handleThemeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select value={(settings.fontFamily as string) || 'sans'} onValueChange={handleFontFamilyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a font family" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sans">Sans-serif</SelectItem>
                <SelectItem value="serif">Serif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Font Size</Label>
            <Select value={(settings.fontSize as string) || '1'} onValueChange={handleFontSizeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.875">Small</SelectItem>
                <SelectItem value="1">Medium</SelectItem>
                <SelectItem value="1.125">Large</SelectItem>
                <SelectItem value="1.25">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
