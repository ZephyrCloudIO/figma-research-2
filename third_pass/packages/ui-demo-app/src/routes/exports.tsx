import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, lazy, Suspense } from 'react'
import { FileImage, Code, Image, FileJson, Loader2, DollarSign, Zap } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JsonViewer } from '@/components/ui/json-viewer'
import { loadExports, loadFigmaJson, type FigmaExport } from '@/lib/exports-store'

export const Route = createFileRoute('/exports')({
  component: ExportsPage,
})

function ExportsPage() {
  const [exports, setExports] = useState<FigmaExport[]>([])
  const [selectedExport, setSelectedExport] = useState<FigmaExport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExports().then((data) => {
      setExports(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (exports.length > 0 && !selectedExport) {
      setSelectedExport(exports[0])
    }
  }, [exports, selectedExport])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Figma Exports</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {exports.map((exp) => (
                    <SidebarMenuItem key={exp.id}>
                      <SidebarMenuButton
                        onClick={() => setSelectedExport(exp)}
                        isActive={selectedExport?.id === exp.id}
                      >
                        <FileImage className="w-4 h-4" />
                        <div className="flex flex-col items-start flex-1 min-w-0">
                          <span className="truncate">{exp.name}</span>
                          <span className="text-xs text-neutral-500">
                            {new Date(exp.exportDate).toLocaleDateString()}
                          </span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <main className="flex-1 p-6">
            {selectedExport ? (
              <ExportViewer export={selectedExport} />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-500">
                <div className="text-center">
                  <FileImage className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>No exports found. Run the indexing script to generate exports.</p>
                  <code className="mt-2 text-xs bg-neutral-100 px-2 py-1 rounded">
                    pnpm run index-exports
                  </code>
                </div>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

function ExportViewer({ export: exp }: { export: FigmaExport }) {
  const [figmaJson, setFigmaJson] = useState<any>(null)
  const [loadingJson, setLoadingJson] = useState(false)

  // Load full JSON when needed
  const loadJson = async () => {
    if (figmaJson || !exp.figmaJsonPath) return
    setLoadingJson(true)
    const json = await loadFigmaJson(exp.figmaJsonPath)
    setFigmaJson(json)
    setLoadingJson(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{exp.name}</h1>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <span>Node ID: {exp.nodeId}</span>
          <span>•</span>
          <span>{new Date(exp.exportDate).toLocaleString()}</span>
        </div>
      </div>

      {/* Metadata Cards */}
      {exp.metadata && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
              <Image className="w-4 h-4" />
              Dimensions
            </div>
            <div className="text-lg font-semibold">
              {exp.metadata.width} × {exp.metadata.height}
            </div>
          </div>

          {exp.metadata.generationCost !== undefined && (
            <div className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                <DollarSign className="w-4 h-4" />
                Cost
              </div>
              <div className="text-lg font-semibold">
                ${exp.metadata.generationCost.toFixed(4)}
              </div>
            </div>
          )}

          {exp.metadata.generationTokens !== undefined && (
            <div className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                <Zap className="w-4 h-4" />
                Tokens
              </div>
              <div className="text-lg font-semibold">
                {exp.metadata.generationTokens.toLocaleString()}
              </div>
            </div>
          )}

          {exp.metadata.generationModel && (
            <div className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
                <Code className="w-4 h-4" />
                Model
              </div>
              <div className="text-sm font-semibold">
                {exp.metadata.generationModel.split('/')[1] || exp.metadata.generationModel}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="comparison" className="w-full">
        <TabsList>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="figma">Figma Export</TabsTrigger>
          <TabsTrigger value="generated">Generated Component</TabsTrigger>
          <TabsTrigger value="json" onClick={loadJson}>JSON Structure</TabsTrigger>
        </TabsList>

        {/* Comparison View */}
        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Figma Export */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Figma Export</h2>
                <Badge variant="secondary">Original</Badge>
              </div>
              <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
                <div className="max-h-[800px] overflow-auto p-4">
                  <img
                    src={exp.figmaImagePath}
                    alt={`Figma export: ${exp.name}`}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Generated Component */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Generated Component</h2>
                <Badge variant="secondary">React + ShadCN</Badge>
              </div>
              <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
                <div className="max-h-[800px] overflow-auto p-4">
                  {exp.generatedComponentPath ? (
                    <DynamicComponentRenderer componentName={exp.name} />
                  ) : (
                    <div className="p-8 text-center text-neutral-500">
                      No generated component available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Figma Export Only */}
        <TabsContent value="figma" className="space-y-4">
          <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
            <div className="p-4">
              <img
                src={exp.figmaImagePath}
                alt={`Figma export: ${exp.name}`}
                className="w-full"
              />
            </div>
          </div>
        </TabsContent>

        {/* Generated Component Only */}
        <TabsContent value="generated" className="space-y-4">
          <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
            <div className="p-4">
              {exp.generatedComponentPath ? (
                <DynamicComponentRenderer componentName={exp.name} />
              ) : (
                <div className="p-8 text-center text-neutral-500">
                  No generated component available
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* JSON Structure */}
        <TabsContent value="json" className="space-y-4">
          {loadingJson ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
            </div>
          ) : figmaJson ? (
            <JsonViewer data={figmaJson} defaultExpanded={false} maxHeight="800px" />
          ) : (
            <div className="p-8 text-center text-neutral-500">
              <FileJson className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No JSON data available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Dynamically load and render a generated component
 */
function DynamicComponentRenderer({ componentName }: { componentName: string }) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Dynamic import of the component
    import(`@/components/generated/${componentName}.tsx`)
      .then((module) => {
        // Try different export patterns
        const comp = module[componentName] || module.default || module[Object.keys(module)[0]]
        if (comp) {
          setComponent(() => comp)
        } else {
          setError(`Component "${componentName}" has no valid export`)
        }
      })
      .catch((err) => {
        console.error('Failed to load component:', err)
        setError(`Failed to load component: ${err.message}`)
      })
  }, [componentName])

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
        <p className="text-xs mt-2 text-neutral-500">
          Component path: @/components/generated/{componentName}.tsx
        </p>
      </div>
    )
  }

  if (!Component) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
        </div>
      }
    >
      <Component />
    </Suspense>
  )
}
