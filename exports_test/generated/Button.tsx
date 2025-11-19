import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, ArrowRight, Moon, Sun } from 'lucide-react';

export default function ButtonDocumentation() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
        {/* Header Section */}
        <header className="border-b border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-slate-500 dark:text-slate-400">Components</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-50">Button</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 max-w-2xl">
              Displays a button or a component that looks like a button.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-sm text-slate-900 dark:text-slate-50 hover:underline font-medium">
                Developer docs
              </a>
              <a href="#" className="text-sm text-slate-900 dark:text-slate-50 hover:underline font-medium">
                Designer docs
              </a>
            </div>
          </div>
        </header>

        {/* Playground Section */}
        <main className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Playground</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="gap-2"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4" />
                  Dark
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  Light
                </>
              )}
            </Button>
          </div>

          {/* Light Theme Section */}
          <div className="space-y-12">
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Light</h3>
              
              {/* Row 1 - Small Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button variant="default" size="sm">
                  Button
                </Button>
                <Button variant="outline" size="sm">
                  Outline
                </Button>
                <Button variant="ghost" size="sm">
                  Ghost
                </Button>
                <Button variant="default" size="sm">
                  Desctructive
                </Button>
                <Button variant="secondary" size="sm">
                  Secondary
                </Button>
                <Button variant="link" size="sm">
                  Link
                </Button>
                <Button variant="default" size="sm">
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
                <Button variant="default" size="sm">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="default" size="sm" disabled>
                  Please wait
                </Button>
              </div>

              {/* Row 2 - Small Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button variant="default" size="sm">
                  Small
                </Button>
                <Button variant="outline" size="sm">
                  Outline
                </Button>
                <Button variant="ghost" size="sm">
                  Ghost
                </Button>
                <Button variant="default" size="sm">
                  Desctructive
                </Button>
                <Button variant="secondary" size="sm">
                  Secondary
                </Button>
                <Button variant="link" size="sm">
                  Link
                </Button>
                <Button variant="default" size="sm">
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
                <Button variant="default" size="sm">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="default" size="sm" disabled>
                  Please wait
                </Button>
              </div>

              {/* Row 3 - Large Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button variant="default" size="default">
                  Large
                </Button>
                <Button variant="outline" size="default">
                  Outline
                </Button>
                <Button variant="ghost" size="default">
                  Ghost
                </Button>
                <Button variant="default" size="default">
                  Desctructive
                </Button>
                <Button variant="secondary" size="default">
                  Secondary
                </Button>
                <Button variant="link" size="default">
                  Link
                </Button>
                <Button variant="default" size="default">
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
                <Button variant="default" size="default">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="default" size="default" disabled>
                  Please wait
                </Button>
              </div>
            </div>

            {/* Dark Theme Section */}
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Dark</h3>
              
              {/* Row 1 - Small Buttons with Outline variant for icons */}
              <div className="flex flex-wrap gap-4">
                <Button variant="default" size="sm">
                  Button
                </Button>
                <Button variant="outline" size="sm">
                  Outline
                </Button>
                <Button variant="ghost" size="sm">
                  Ghost
                </Button>
                <Button variant="default" size="sm">
                  Desctructive
                </Button>
                <Button variant="secondary" size="sm">
                  Secondary
                </Button>
                <Button variant="link" size="sm">
                  Link
                </Button>
                <Button variant="outline" size="sm">
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
                <Button variant="outline" size="sm">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Please wait
                </Button>
              </div>

              {/* Row 2 - Small Buttons with Outline variant for icons */}
              <div className="flex flex-wrap gap-4">
                <Button variant="default" size="sm">
                  Small
                </Button>
                <Button variant="outline" size="sm">
                  Outline
                </Button>
                <Button variant="ghost" size="sm">
                  Ghost
                </Button>
                <Button variant="default" size="sm">
                  Desctructive
                </Button>
                <Button variant="secondary" size="sm">
                  Secondary
                </Button>
                <Button variant="link" size="sm">
                  Link
                </Button>
                <Button variant="outline" size="sm">
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
                <Button variant="outline" size="sm">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Please wait
                </Button>
              </div>

              {/* Row 3 - Large Buttons with Outline variant for icons */}
              <div className="flex flex-wrap gap-4">
                <Button variant="default" size="default">
                  Large
                </Button>
                <Button variant="outline" size="default">
                  Outline
                </Button>
                <Button variant="ghost" size="default">
                  Ghost
                </Button>
                <Button variant="default" size="default">
                  Desctructive
                </Button>
                <Button variant="secondary" size="default">
                  Secondary
                </Button>
                <Button variant="link" size="default">
                  Link
                </Button>
                <Button variant="outline" size="default">
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
                <Button variant="outline" size="default">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="default" disabled>
                  Please wait
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer Section */}
        <footer className="border-t border-slate-200 dark:border-slate-800 mt-24">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                © 2025 shadcndesign.com
              </p>
              <a href="#" className="text-sm text-slate-900 dark:text-slate-50 hover:underline font-medium">
                Docs
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}