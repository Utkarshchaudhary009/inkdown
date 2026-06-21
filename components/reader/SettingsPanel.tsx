'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/lib/db-hooks';
import { useTheme, type Theme } from '@/components/ThemeProvider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "sonner";

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const { settings, setSetting } = useSettings();

  const handleThemeChange = (value: string) => {
    setTheme(value as Theme);
    toast("Theme updated to " + value);
  };

  const handleFontFamilyChange = (value: string) => {
    setSetting('fontFamily', value);
    toast("Font family updated");
  };

  const handleFontSizeChange = (value: string) => {
    setSetting('fontSize', value);
    toast("Font size updated");
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
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="sepia">Sepia</SelectItem>
                <SelectItem value="night">Night</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
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
