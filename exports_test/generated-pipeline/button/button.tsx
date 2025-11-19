```typescript
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Circle, Send, ArrowRight, LoaderCircle } from "lucide-react"

interface ButtonShowcaseProps {
  className?: string
}

export function ButtonShowcase({ className }: ButtonShowcaseProps) {
  return (
    <div className={`bg-white flex flex-col items-center ${className || ""}`}>
      <div className="bg-white py-32 gap-16 flex flex-col items-center w-full">
        <div className="gap-16 flex justify-center">
          <div className="gap-2 flex flex-col">
            <div className="border border-neutral-200 gap-0 flex justify-center">
              <div className="p-4 gap-2 flex items-center justify-center">
                <h1 className="text-4xl font-bold text-[#0a0a0a] font-inter">Typography</h1>
                <a href="#" className="rounded-xl px-2 gap-2 flex items-center hover:bg-neutral-100 transition-colors">
                  <span className="text-base font-medium text-[#0a0a0a] font-inter">Developer docs</span>
                </a>
                <a href="#" className="rounded-xl px-2 gap-2 flex items-center hover:bg-neutral-100 transition-colors">
                  <span className="text-base font-medium text-[#0a0a0a] font-inter">Designer docs</span>
                </a>
                <span className="text-xs font-light text-[#737373] font-['Chivo_Mono'] tracking-[5px]">COMPONENTS</span>
              </div>
            </div>
            <div className="border border-neutral-200 gap-0 flex justify-center">
              <div className="p-4 gap-2 flex">
                <p className="text-lg font-normal text-[#737373] font-inter leading-7">Styles for typography elements such as headings, paragraphs, lists that are used within the rich text.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="gap-4 flex flex-col items-center w-full max-w-7xl px-4">
          <div className="px-4 gap-2 flex justify-center">
            <div className="px-4 gap-4 flex items-center justify-center">
              <h2 className="text-xl font-semibold text-[#0a0a0a] font-inter">Playground</h2>
            </div>
          </div>

          <div className="border border-neutral-200 gap-4 flex flex-col items-center w-full">
            <div className="bg-neutral-100 p-4 gap-4 flex flex-col w-full">
              <div className="bg-white border border-neutral-200 rounded-2xl py-32 px-4 gap-16 shadow-sm flex flex-col items-center justify-center w-full">
                <Button className="bg-violet-600 hover:bg-violet-700 rounded-lg py-2 px-4 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-4 h-4 text-violet-50" />
                  <span className="text-sm font-medium text-violet-50 font-inter">Button</span>
                  <Circle className="w-4 h-4 text-violet-50" />
                </Button>

                <Button variant="outline" className="bg-white hover:bg-neutral-50 rounded-lg py-2 px-4 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="text-sm font-medium text-[#0a0a0a] font-inter">Button</span>
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                </Button>

                <Button variant="ghost" className="bg-transparent hover:bg-neutral-100 rounded-lg py-2 px-4 gap-2 flex items-center justify-center">
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="text-sm font-medium text-[#0a0a0a] font-inter">Button</span>
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                </Button>

                <Button variant="destructive" className="bg-red-600 hover:bg-red-700 rounded-lg py-2 px-4 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-4 h-4 text-red-50" />
                  <span className="text-sm font-medium text-red-50 font-inter">Button</span>
                  <Circle className="w-4 h-4 text-red-50" />
                </Button>

                <Button variant="secondary" className="bg-neutral-800 hover:bg-neutral-900 rounded-lg py-2 px-4 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-4 h-4 text-neutral-50" />
                  <span className="text-sm font-medium text-neutral-50 font-inter">Button</span>
                  <Circle className="w-4 h-4 text-neutral-50" />
                </Button>

                <Button variant="link" className="bg-transparent hover:underline rounded-lg py-2 px-4 gap-2 flex items-center justify-center">
                  <Circle className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-medium text-violet-600 font-inter">Button</span>
                  <Circle className="w-4 h-4 text-violet-600" />
                </Button>

                <Button variant="outline" className="bg-white hover:bg-neutral-50 rounded-lg py-2 px-4 gap-2 shadow-sm flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="text-sm font-medium text-[#0a0a0a] font-inter">Button</span>
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                </Button>

                <Button variant="outline" className="bg-white hover:bg-neutral-50 rounded-lg py-2 px-4 gap-2 shadow-sm flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="text-sm font-medium text-[#0a0a0a] font-inter">Button</span>
                  <ArrowRight className="w-4 h-4 text-[#0a0a0a]" />
                </Button>

                <Button variant="outline" className="bg-white hover:bg-neutral-50 rounded-lg py-2 px-4 gap-2 shadow-sm flex items-center justify-center" disabled>
                  <LoaderCircle className="w-4 h-4 text-[#0a0a0a] animate-spin" />
                  <span className="text-sm font-medium text-[#0a0a0a] font-inter">Button</span>
                </Button>

                <Button className="bg-violet-600 hover:bg-violet-700 rounded-lg py-2 px-3 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-3 h-3 text-violet-50" />
                  <span className="text-xs font-medium text-violet-50 font-inter">Button</span>
                  <Circle className="w-3 h-3 text-violet-50" />
                </Button>

                <Button variant="outline" className="bg-white hover:bg-neutral-50 rounded-lg py-2 px-3 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-3 h-3 text-[#0a0a0a]" />
                  <span className="text-xs font-medium text-[#0a0a0a] font-inter">Button</span>
                  <Circle className="w-3 h-3 text-[#0a0a0a]" />
                </Button>

                <Button variant="ghost" className="bg-transparent hover:bg-neutral-100 rounded-lg py-2 px-3 gap-2 flex items-center justify-center">
                  <Circle className="w-3 h-3 text-[#0a0a0a]" />
                  <span className="text-xs font-medium text-[#0a0a0a] font-inter">Button</span>
                  <Circle className="w-3 h-3 text-[#0a0a0a]" />
                </Button>

                <Button variant="destructive" className="bg-red-600 hover:bg-red-700 rounded-lg py-2 px-3 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-3 h-3 text-red-50" />
                  <span className="text-xs font-medium text-red-50 font-inter">Button</span>
                  <Circle className="w-3 h-3 text-red-50" />
                </Button>

                <Button variant="secondary" className="bg-neutral-800 hover:bg-neutral-900 rounded-lg py-2 px-3 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-3 h-3 text-neutral-50" />
                  <span className="text-xs font-medium text-neutral-50 font-inter">Button</span>
                  <Circle className="w-3 h-3 text-neutral-50" />
                </Button>

                <Button variant="link" className="bg-transparent hover:underline rounded-lg py-2 px-3 gap-2 flex items-center justify-center">
                  <Circle className="w-3 h-3 text-violet-600" />
                  <span className="text-xs font-medium text-violet-600 font-inter">Button</span>
                  <Circle className="w-3 h-3 text-violet-600" />
                </Button>

                <Button variant="outline" className="bg-white hover:bg-neutral-50 rounded-lg py-2 px-3 gap-2 shadow-sm flex items-center justify-center">
                  <Send className="w-3 h-3 text-[#0a0a0a]" />
                  <span className="text-xs font-medium text-[#0a0a0a] font-inter">Button</span>
                  <Circle className="w-3 h-3 text-[#0a0a0a]" />
                </Button>

                <Button variant="outline" className="bg-white hover:bg-neutral-50 rounded-lg py-2 px-3 gap-2 shadow-sm flex items-center justify-center">
                  <Send className="w-3 h-3 text-[#0a0a0a]" />
                  <span className="text-xs font-medium text-[#0a0a0a] font-inter">Button</span>
                  <ArrowRight className="w-3 h-3 text-[#0a0a0a]" />
                </Button>

                <Button variant="outline" className="bg-white hover:bg-neutral-50 rounded-lg py-2 px-3 gap-2 shadow-sm flex items-center justify-center" disabled>
                  <LoaderCircle className="w-3 h-3 text-[#0a0a0a] animate-spin" />
                  <span className="text-xs font-medium text-[#0a0a0a] font-inter">Button</span>
                </Button>

                <Button className="bg-violet-600 hover:bg-violet-700 rounded-lg py-2 px-8 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-4 h-4 text-violet-50" />
                  <span className="text-sm font-medium text-violet-50 font-inter">Button</span>
                  <Circle className="w-4 h-4 text-violet-50" />
                </Button>

                <Button variant="outline" className="bg-white hover:bg-neutral-50 rounded-lg py-2 px-8 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="text-sm font-medium text-[#0a0a0a] font-inter">Button</span>
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                </Button>

                <Button variant="ghost" className="bg-transparent hover:bg-neutral-100 rounded-lg py-2 px-8 gap-2 flex items-center justify-center">
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="text-sm font-medium text-[#0a0a0a] font-inter">Button</span>
                  <Circle className="w-4 h-4 text-[#0a0a0a]" />
                </Button>

                <Button variant="destructive" className="bg-red-600 hover:bg-red-700 rounded-lg py-2 px-8 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-4 h-4 text-red-50" />
                  <span className="text-sm font-medium text-red-50 font-inter">Button</span>
                  <Circle className="w-4 h-4 text-red-50" />
                </Button>

                <Button variant="secondary" className="bg-neutral-800 hover:bg-neutral-900 rounded-lg py-2 px-8 gap-2 shadow-sm flex items-center justify-center">
                  <Circle className="w-4 h-4 text-neutral-50" />
                  <span className="text-sm font-medium text-neutral-50 font-inter">Button</span>
                  <Circle className="w-4 h-4 text-neutral-50" />
                </Button>

                <Button variant="link" className="bg-transparent hover:underline rounded-lg py-2 px-8 gap-2 flex items-center justify-center">
                  <Circle className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-medium text-violet-600 font-inter">Button</span>
                  <Circle className="w-4 h-4 text-violet-600" />
                </Button>

                <Button variant="outline" className="bg-white hover:bg-neutral-50 rounded-lg py-2 px-8 gap-2 shadow-sm flex items-center justify-center">
                  <Send className="w-4 h-4 text-[#0a0a0a]" />
                  <span className="text-sm font-medium text-[#0a0a0a] font-inter">Button</span>
                  <Circle className