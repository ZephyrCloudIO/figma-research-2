```typescript
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon, FileText, ExternalLink } from 'lucide-react';

interface ButtonComponentProps {
  className?: string;
}

export const ButtonComponent: React.FC<ButtonComponentProps> = ({ className }) => {
  return (
    <div className={className}>
      <div className="w-full">
        <div className="w-full">
          <div className="w-full">
            <div className="w-full">
              <div className="mb-8">
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-4xl font-bold">Typography</h1>
                    <a href="#" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                      <FileText className="w-4 h-4" />
                      Developer
                    </a>
                    <a href="#" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                      <ExternalLink className="w-4 h-4" />
                      Designer
                    </a>
                    <span className="text-sm text-muted-foreground">Components</span>
                  </div>
                </div>
                <div>
                  <div>
                    <p className="text-muted-foreground">Styles for typography elements such as headings, paragraphs, lists that are used within the rich text.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-4">
              <div>
                <h2 className="text-2xl font-semibold">Playground</h2>
              </div>
            </div>
            <div>
              <div className="space-y-8">
                <div className="rounded-lg border bg-background p-8">
                  <div className="grid grid-cols-6 gap-4">
                    <Button variant="default">Button</Button>
                    <Button variant="default">Button</Button>
                    <Button variant="default">Button</Button>
                    <Button variant="default">Button</Button>
                    <Button variant="default">Button</Button>
                    <Button variant="default">Button</Button>
                    <Button variant="secondary">Button</Button>
                    <Button variant="secondary">Button</Button>
                    <Button variant="secondary">Button</Button>
                    <Button variant="secondary">Button</Button>
                    <Button variant="secondary">Button</Button>
                    <Button variant="secondary">Button</Button>
                    <Button variant="outline">Button</Button>
                    <Button variant="outline">Button</Button>
                    <Button variant="outline">Button</Button>
                    <Button variant="outline">Button</Button>
                    <Button variant="outline">Button</Button>
                    <Button variant="outline">Button</Button>
                    <Button variant="ghost">Button</Button>
                    <Button variant="ghost">Button</Button>
                    <Button variant="ghost">Button</Button>
                    <Button variant="ghost">Button</Button>
                    <Button variant="ghost">Button</Button>
                    <Button variant="ghost">Button</Button>
                    <Button variant="link">Button</Button>
                    <Button variant="link">Button</Button>
                    <Button variant="link">Button</Button>
                    <Sun className="w-5 h-5" />
                  </div>
                </div>

                <div className="rounded-lg border bg-slate-950 p-8">
                  <div className="grid grid-cols-6 gap-4">
                    <Button variant="default" className="dark">Button</Button>
                    <Button variant="default" className="dark">Button</Button>
                    <Button variant="default" className="dark">Button</Button>
                    <Button variant="default" className="dark">Button</Button>
                    <Button variant="default" className="dark">Button</Button>
                    <Button variant="default" className="dark">Button</Button>
                    <Button variant="secondary" className="dark">Button</Button>
                    <Button variant="secondary" className="dark">Button</Button>
                    <Button variant="secondary" className="dark">Button</Button>
                    <Button variant="secondary" className="dark">Button</Button>
                    <Button variant="secondary" className="dark">Button</Button>
                    <Button variant="secondary" className="dark">Button</Button>
                    <Button variant="outline" className="dark">Button</Button>
                    <Button variant="outline" className="dark">Button</Button>
                    <Button variant="outline" className="dark">Button</Button>
                    <Button variant="outline" className="dark">Button</Button>
                    <Button variant="outline" className="dark">Button</Button>
                    <Button variant="outline" className="dark">Button</Button>
                    <Button variant="ghost" className="dark">Button</Button>
                    <Button variant="ghost" className="dark">Button</Button>
                    <Button variant="ghost" className="dark">Button</Button>
                    <Button variant="ghost" className="dark">Button</Button>
                    <Button variant="ghost" className="dark">Button</Button>
                    <Button variant="ghost" className="dark">Button</Button>
                    <Button variant="link" className="dark text-slate-100">Button</Button>
                    <Button variant="link" className="dark text-slate-100">Button</Button>
                    <Button variant="link" className="dark text-slate-100">Button</Button>
                    <Moon className="w-5 h-5 text-slate-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 mt-8">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">© 2025 shadcndesign.com</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Docs</span>
                  <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Licensing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-b" />
    </div>
  );
};
```