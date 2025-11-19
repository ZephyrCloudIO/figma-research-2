import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { loadExports, type Export } from '@/lib/exports-store';

interface ValidationResult {
  status: 'passed' | 'failed' | 'error';
  similarity: number;
  diffPixels: number;
  totalPixels: number;
  diffImagePath?: string;
  error?: string;
}

export function ValidationComparison() {
  const [exports, setExports] = useState<Export[]>([]);
  const [selectedView, setSelectedView] = useState<'side-by-side' | 'stacked'>('stacked');

  useEffect(() => {
    loadExports().then(setExports);
  }, []);

  // Mock validation results - in real app would load from validation output
  const getValidationResult = (exportId: string): ValidationResult => {
    // These are the actual results from our validation
    const results: Record<string, ValidationResult> = {
      'button-showcase': {
        status: 'failed',
        similarity: 63.32,
        diffPixels: 3709948,
        totalPixels: 10114560,
        diffImagePath: '/validation-results/button-showcase-diff.png',
      },
      'item': {
        status: 'failed',
        similarity: 62.27,
        diffPixels: 3816724,
        totalPixels: 10114560,
        diffImagePath: '/validation-results/item-diff.png',
      },
    };
    return results[exportId] || {
      status: 'error',
      similarity: 0,
      diffPixels: 0,
      totalPixels: 0,
      error: 'No validation data',
    };
  };

  const getStatusColor = (status: ValidationResult['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'error':
        return 'bg-yellow-500';
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'text-green-600';
    if (similarity >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Visual Validation Comparison</h1>
        <p className="text-muted-foreground">
          Compare Figma exports with generated components
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSelectedView('stacked')}
          className={`px-4 py-2 rounded ${
            selectedView === 'stacked'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary'
          }`}
        >
          Stacked View
        </button>
        <button
          onClick={() => setSelectedView('side-by-side')}
          className={`px-4 py-2 rounded ${
            selectedView === 'side-by-side'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary'
          }`}
        >
          Side-by-Side
        </button>
      </div>

      <div className="space-y-8">
        {exports.map((exp) => {
          const result = getValidationResult(exp.id);
          const generatedPath = `/validation-results/${exp.id}-generated.png`;

          return (
            <Card key={exp.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>{exp.name}</CardTitle>
                    <CardDescription>Export ID: {exp.id}</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(result.status)}>
                      {result.status.toUpperCase()}
                    </Badge>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${getSimilarityColor(
                          result.similarity
                        )}`}
                      >
                        {result.similarity.toFixed(2)}%
                      </div>
                      <div className="text-xs text-muted-foreground">similarity</div>
                    </div>
                  </div>
                </div>
                {result.diffPixels > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Diff: {result.diffPixels.toLocaleString()} /{' '}
                    {result.totalPixels.toLocaleString()} pixels
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="comparison" className="w-full">
                  <TabsList>
                    <TabsTrigger value="comparison">Comparison</TabsTrigger>
                    <TabsTrigger value="diff">Diff Highlight</TabsTrigger>
                    <TabsTrigger value="figma-only">Figma Only</TabsTrigger>
                    <TabsTrigger value="generated-only">Generated Only</TabsTrigger>
                  </TabsList>

                  <TabsContent value="comparison" className="space-y-4">
                    {selectedView === 'stacked' ? (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Figma Export</h3>
                          <div className="border rounded-lg overflow-hidden bg-background">
                            <img
                              src={exp.figmaImagePath}
                              alt={`${exp.name} - Figma Export`}
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Generated Component</h3>
                          <div className="border rounded-lg overflow-hidden bg-background">
                            <img
                              src={generatedPath}
                              alt={`${exp.name} - Generated`}
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Figma Export</h3>
                          <div className="border rounded-lg overflow-hidden bg-background">
                            <img
                              src={exp.figmaImagePath}
                              alt={`${exp.name} - Figma Export`}
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Generated Component</h3>
                          <div className="border rounded-lg overflow-hidden bg-background">
                            <img
                              src={generatedPath}
                              alt={`${exp.name} - Generated`}
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="diff">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Red areas indicate pixel differences between Figma export and
                        generated component
                      </p>
                      <div className="border rounded-lg overflow-hidden bg-background">
                        <img
                          src={result.diffImagePath}
                          alt={`${exp.name} - Diff`}
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="figma-only">
                    <div className="border rounded-lg overflow-hidden bg-background">
                      <img
                        src={exp.figmaImagePath}
                        alt={`${exp.name} - Figma Export`}
                        className="w-full h-auto"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="generated-only">
                    <div className="border rounded-lg overflow-hidden bg-background">
                      <img
                        src={generatedPath}
                        alt={`${exp.name} - Generated`}
                        className="w-full h-auto"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {exports.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              No exports found. Run validation first.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
