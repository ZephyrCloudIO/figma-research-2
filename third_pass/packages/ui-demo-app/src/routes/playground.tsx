import { createFileRoute } from '@tanstack/react-router'
import { Play, RotateCcw, Copy, Download } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/playground')({
  component: PlaygroundPage,
})

const defaultCode = `import React from 'react'

export function Button({ children, variant = 'primary', ...props }) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors'
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  }

  return (
    <button
      className={\`\${baseStyles} \${variantStyles[variant]}\`}
      {...props}
    >
      {children}
    </button>
  )
}

// Usage Example
export default function Demo() {
  return (
    <div className="flex gap-4 p-8">
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
    </div>
  )
}`

function PlaygroundPage() {
  const [code, setCode] = useState(defaultCode)
  const [error, setError] = useState<string | null>(null)

  const handleRun = () => {
    setError(null)
    // In a real implementation, this would transpile and render the code
    console.log('Running code:', code)
  }

  const handleReset = () => {
    setCode(defaultCode)
    setError(null)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'component.tsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-8rem)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Code Playground</h1>
          <p className="text-muted-foreground">
            Experiment with generated components in a live editor
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRun}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" />
            Run
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 h-[calc(100%-8rem)]">
        {/* Code Editor */}
        <div className="flex flex-col bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-muted border-b border-border">
            <h2 className="font-semibold">Code Editor</h2>
          </div>
          <div className="flex-1 overflow-auto">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 bg-background font-mono text-sm resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border-t border-red-500/20 text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="flex flex-col bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-muted border-b border-border">
            <h2 className="font-semibold">Preview</h2>
          </div>
          <div className="flex-1 overflow-auto p-8 bg-background">
            {/* In a real implementation, this would render the transpiled code */}
            <div className="flex gap-4">
              <button className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Primary Button
              </button>
              <button className="px-4 py-2 rounded-lg font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                Secondary Button
              </button>
            </div>
            <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground text-center">
                Live preview will appear here when code is executed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Component Selector */}
      <div className="mt-6 bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Load Component</h3>
        <div className="flex gap-2 flex-wrap">
          <ComponentChip name="Button" />
          <ComponentChip name="Input" />
          <ComponentChip name="Card" />
          <ComponentChip name="Dialog" />
          <ComponentChip name="Form" />
          <ComponentChip name="Custom..." />
        </div>
      </div>
    </div>
  )
}

interface ComponentChipProps {
  name: string
}

function ComponentChip({ name }: ComponentChipProps) {
  return (
    <button className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted hover:border-primary/50 transition-colors">
      {name}
    </button>
  )
}
