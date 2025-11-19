```typescript
import * as React from "react"
import { Button } from "@/components/ui/button"
import { FileText, ArrowRight, Circle, Send, Loader2, Sun, Moon } from "lucide-react"

interface ButtonShowcaseProps {
  className?: string
}

export function ButtonShowcase({ className }: ButtonShowcaseProps) {
  return (
    <div className={`bg-white flex flex-col items-center ${className || ""}`}>
      <div className="bg-white py-32 gap-16 flex flex-col items-center w-full">
        <div className="gap-16 flex justify-center">
          <div className="gap-2 flex flex-col">
            <div className="gap-0 flex justify-center border border-neutral-200">
              <div className="p-4 gap-2 flex items-center justify-center">
                <h1 className="text-4xl font-bold text-[#0a0a0a] tracking-[0px]">Typography</h1>
                <div className="rounded-xl px-2 gap-2 flex items-center">
                  <span className="text-base font-medium text-[#0a0a0a]">Developer docs</span>
                </div>
                <div className="rounded-xl px-2 gap-2 flex items-center">
                  <span className="text-base font-medium text-[#0a0a0a]">Designer docs</span>
                </div>
                <span className="text-xs font-light text-[#737373] tracking-[5px]">COMPONENTS</span>
              </div>
            </div>
            <div className="gap-0 flex justify-center border border-neutral-200">
              <div className="p-4 gap-2 flex">
                <p className="text-lg font-normal text-[#737373]">Styles for typography elements such as headings, paragraphs, lists that are used within the rich text.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="gap-4 flex flex-col items-center">
          <div className="px-4 gap-2 flex justify-center">
            <div className="px-4 gap-4 flex items-center justify-center">
              <h2 className="text-xl font-semibold text-[#0a0a0a]">Playground</h2>
            </div>
          </div>

          <div className="gap-4 flex flex-col items-center border border-neutral-200">
            <div className="p-4 gap-4 flex flex-col bg-neutral-100 bg-opacity-40">
              <div className="bg-white rounded-2xl py-32 px-4 gap-16 shadow-sm flex flex-col items-center justify-center border border-neutral-200">
                <Button className="bg-violet-600 rounded-lg py-2 px-4 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-4 h-4 text-violet-50" />
                  <span className="text-sm font-medium text-violet-50">Button</span>
                  <Circle className="w-4 h-4 text-violet-50" />
                </Button>

                <Button variant="outline" className="bg-white rounded-lg py-2 px-4 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="text-sm font-medium text-[#0a0a0a]">Button</span>
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                </Button>

                <Button variant="ghost" className="bg-transparent rounded-lg py-2 px-4 gap-2 flex items-center justify-center">
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="text-sm font-medium text-[#0a0a0a]">Button</span>
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                </Button>

                <Button variant="destructive" className="bg-red-600 rounded-lg py-2 px-4 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-4 h-4 text-red-50" />
                  <span className="text-sm font-medium text-red-50">Button</span>
                  <Circle className="w-4 h-4 text-red-50" />
                </Button>

                <Button variant="secondary" className="bg-neutral-100 rounded-lg py-2 px-4 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-4 h-4 text-neutral-900" />
                  <span className="text-sm font-medium text-neutral-900">Button</span>
                  <Circle className="w-4 h-4 text-neutral-900" />
                </Button>

                <Button variant="ghost" className="bg-transparent rounded-lg py-2 px-4 gap-2 flex items-center justify-center">
                  <Circle className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-medium text-violet-600">Button</span>
                  <Circle className="w-4 h-4 text-violet-600" />
                </Button>

                <Button variant="outline" className="bg-white rounded-lg py-2 px-4 gap-2 shadow-sm flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="text-sm font-medium text-[#0a0a0a]">Button</span>
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                </Button>

                <Button variant="outline" className="bg-white rounded-lg py-2 px-4 gap-2 shadow-sm flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="text-sm font-medium text-[#0a0a0a]">Button</span>
                  <ArrowRight className="w-4 h-4 text-[#0a0a0a]" />
                </Button>

                <Button variant="outline" className="bg-white rounded-lg py-2 px-4 gap-2 shadow-sm flex items-center justify-center" disabled>
                  <Loader2 className="w-4 h-4 text-[#0a0a0a] animate-spin" />
                  <span className="text-sm font-medium text-[#0a0a0a]">Button</span>
                </Button>

                <Button className="bg-violet-600 rounded-lg py-2 px-3 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-3 h-3 text-violet-50" />
                  <span className="text-xs font-medium text-violet-50">Button</span>
                  <Circle className="w-3 h-3 text-violet-50" />
                </Button>

                <Button variant="outline" className="bg-white rounded-lg py-2 px-3 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-3 h-3 text-[#0a0a0a]" />
                  <span className="text-xs font-medium text-[#0a0a0a]">Button</span>
                  <Circle className="w-3 h-3 text-[#0a0a0a]" />
                </Button>

                <Button variant="ghost" className="bg-transparent rounded-lg py-2 px-3 gap-2 flex items-center justify-center">
                  <Circle className="w-3 h-3 text-[#0a0a0a]" />
                  <span className="text-xs font-medium text-[#0a0a0a]">Button</span>
                  <Circle className="w-3 h-3 text-[#0a0a0a]" />
                </Button>

                <Button variant="destructive" className="bg-red-600 rounded-lg py-2 px-3 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-3 h-3 text-red-50" />
                  <span className="text-xs font-medium text-red-50">Button</span>
                  <Circle className="w-3 h-3 text-red-50" />
                </Button>

                <Button variant="secondary" className="bg-neutral-100 rounded-lg py-2 px-3 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-3 h-3 text-neutral-900" />
                  <span className="text-xs font-medium text-neutral-900">Button</span>
                  <Circle className="w-3 h-3 text-neutral-900" />
                </Button>

                <Button variant="ghost" className="bg-transparent rounded-lg py-2 px-3 gap-2 flex items-center justify-center">
                  <Circle className="w-3 h-3 text-violet-600" />
                  <span className="text-xs font-medium text-violet-600">Button</span>
                  <Circle className="w-3 h-3 text-violet-600" />
                </Button>

                <Button variant="outline" className="bg-white rounded-lg py-2 px-3 gap-2 shadow-sm flex items-center justify-center">
                  <Send className="w-3 h-3 text-[#0a0a0a]" />
                  <span className="text-xs font-medium text-[#0a0a0a]">Button</span>
                  <Circle className="w-3 h-3 text-[#0a0a0a]" />
                </Button>

                <Button variant="outline" className="bg-white rounded-lg py-2 px-3 gap-2 shadow-sm flex items-center justify-center">
                  <Send className="w-3 h-3 text-[#0a0a0a]" />
                  <span className="text-xs font-medium text-[#0a0a0a]">Button</span>
                  <ArrowRight className="w-3 h-3 text-[#0a0a0a]" />
                </Button>

                <Button variant="outline" className="bg-white rounded-lg py-2 px-3 gap-2 shadow-sm flex items-center justify-center" disabled>
                  <Loader2 className="w-3 h-3 text-[#0a0a0a] animate-spin" />
                  <span className="text-xs font-medium text-[#0a0a0a]">Button</span>
                </Button>

                <Button className="bg-violet-600 rounded-lg py-2 px-8 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-4 h-4 text-violet-50" />
                  <span className="text-sm font-medium text-violet-50">Button</span>
                  <Circle className="w-4 h-4 text-violet-50" />
                </Button>

                <Button variant="outline" className="bg-white rounded-lg py-2 px-8 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="text-sm font-medium text-[#0a0a0a]">Button</span>
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                </Button>

                <Button variant="ghost" className="bg-transparent rounded-lg py-2 px-8 gap-2 flex items-center justify-center">
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="text-sm font-medium text-[#0a0a0a]">Button</span>
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                </Button>

                <Button variant="destructive" className="bg-red-600 rounded-lg py-2 px-8 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-4 h-4 text-red-50" />
                  <span className="text-sm font-medium text-red-50">Button</span>
                  <Circle className="w-4 h-4 text-red-50" />
                </Button>

                <Button variant="secondary" className="bg-neutral-100 rounded-lg py-2 px-8 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-4 h-4 text-neutral-900" />
                  <span className="text-sm font-medium text-neutral-900">Button</span>
                  <Circle className="w-4 h-4 text-neutral-900" />
                </Button>

                <Button variant="ghost" className="bg-transparent rounded-lg py-2 px-8 gap-2 flex items-center justify-center">
                  <Circle className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-medium text-violet-600">Button</span>
                  <Circle className="w-4 h-4 text-violet-600" />
                </Button>

                <Button variant="outline" className="bg-white rounded-lg py-2 px-8 gap-2 shadow-sm flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="text-sm font-medium text-[#0a0a0a]">Button</span>
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                </Button>

                <Button variant="outline" className="bg-white rounded-lg py-2 px-8 gap-2 shadow-sm flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="text-sm font-medium text-[#0a0a0a]">Button</span>
                  <ArrowRight className="w-4 h-4 text-[#0a0a0a]" />
                </Button>

                <Button variant="outline" className="bg-white rounded-lg py-2 px-8 gap-2 shadow-sm flex items-center justify-center" disabled>
                  <Loader2 className="w-4 h-4 text-[#0a0a0a] animate-spin" />
                  <span className="text-sm font-medium text-[#0a0a0a]">Button</span>
                </Button>

                <Sun className="w-6 h-6 text-[#0a0a0a]" />
              </div>

              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl py-32 px-4 gap-16 flex flex-col