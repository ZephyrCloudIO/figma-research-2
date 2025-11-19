import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';

interface SelectionInfo {
  count: number;
  nodes: Array<{ id: string; name: string; type: string }>;
}

interface ExportSettings {
  png: boolean;
  svg: boolean;
  jpg: boolean;
  scale: number;
}

function App() {
  const [selection, setSelection] = useState<SelectionInfo>({ count: 0, nodes: [] });
  const [activeTab, setActiveTab] = useState<'json' | 'images'>('json');
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [exportDuration, setExportDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    png: true,
    svg: true,
    jpg: false,
    scale: 2,
  });

  useEffect(() => {
    window.onmessage = (event) => {
      const msg = event.data.pluginMessage;
      
      if (msg.type === 'selection-changed') {
        setSelection(msg.data);
        setError(null);
      } else if (msg.type === 'json-export-complete') {
        setJsonOutput(JSON.stringify(msg.data.json, null, 2));
        setExportDuration(msg.data.duration);
        setLoading(false);
        setProgress('');
        setError(null);
      } else if (msg.type === 'images-export-complete') {
        downloadImages(msg.data);
        setLoading(false);
        setProgress('');
        setError(null);
      } else if (msg.type === 'progress') {
        setProgress(msg.data.message);
      } else if (msg.type === 'error') {
        setError(msg.error);
        setLoading(false);
        setProgress('');
      }
    };
  }, []);

  const handleGenerateJSON = () => {
    setLoading(true);
    setError(null);
    setJsonOutput('');
    setExportDuration(null);
    parent.postMessage({ pluginMessage: { type: 'generate-json' } }, '*');
  };

  const handleExportImages = () => {
    setLoading(true);
    setError(null);
    parent.postMessage({ 
      pluginMessage: { 
        type: 'export-images', 
        data: exportSettings 
      } 
    }, '*');
  };

  const downloadJSON = () => {
    if (!jsonOutput) return;
    
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const node = selection.nodes[0];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `${node.name.replace(/[^a-zA-Z0-9-_]/g, '_')}_${node.id}_${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyJSON = () => {
    if (!jsonOutput) return;
    navigator.clipboard.writeText(jsonOutput);
  };

  const downloadImages = async (data: any) => {
    const { exports, metadata } = data;

    // Create a ZIP file with all exports
    const zip = new JSZip();

    // Add each exported image to the ZIP
    for (const exp of exports) {
      zip.file(exp.filename, exp.data);
    }

    // Add metadata JSON to the ZIP
    zip.file(`${metadata.nodeName}_metadata.json`, JSON.stringify(metadata, null, 2));

    // Generate the ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Download the ZIP file with a single save dialog
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = metadata.nodeName.replace(/[^a-zA-Z0-9-_]/g, '_');
    a.download = `${cleanName}_${metadata.nodeId}_exports.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMimeType = (format: string): string => {
    switch (format) {
      case 'PNG': return 'image/png';
      case 'SVG': return 'image/svg+xml';
      case 'JPG': return 'image/jpeg';
      default: return 'application/octet-stream';
    }
  };

  const canExport = selection.count === 1;
  const selectedNode = selection.nodes[0];

  return (
    <div className="app">
      <div className="header">
        <h1>Zephyr - Figma to Code</h1>
        <p className="subtitle">Extract images and generate code from Figma designs</p>
      </div>

      <div className="selection-info">
        {selection.count === 0 && (
          <div className="info-box warning">
            <strong>No selection</strong>
            <p>Please select a node, frame, or component to export</p>
          </div>
        )}
        {selection.count === 1 && (
          <div className="info-box success">
            <strong>Selected:</strong> {selectedNode.name}
            <p className="node-type">{selectedNode.type}</p>
          </div>
        )}
        {selection.count > 1 && (
          <div className="info-box warning">
            <strong>Multiple selection</strong>
            <p>Please select only one node to export</p>
          </div>
        )}
      </div>

      {error && (
        <div className="info-box error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {progress && (
        <div className="info-box info">
          <strong>{progress}</strong>
        </div>
      )}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'json' ? 'active' : ''}`}
          onClick={() => setActiveTab('json')}
        >
          Generate as Code (JSON)
        </button>
        <button 
          className={`tab ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          Extract as Image
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'json' && (
          <div className="json-export">
            <div className="section">
              <h3>JSON Export</h3>
              <p className="description">
                Export the complete node graph with all properties, styles, and children
                for code generation and semantic mapping.
              </p>
              
              <button 
                className="primary-button"
                onClick={handleGenerateJSON}
                disabled={!canExport || loading}
              >
                {loading ? 'Generating...' : 'Generate JSON'}
              </button>

              {jsonOutput && (
                <div className="output-section">
                  <div className="output-header">
                    <span>
                      Export complete 
                      {exportDuration && ` in ${exportDuration}ms`}
                    </span>
                    <div className="button-group">
                      <button onClick={copyJSON} className="secondary-button">
                        Copy
                      </button>
                      <button onClick={downloadJSON} className="secondary-button">
                        Download
                      </button>
                    </div>
                  </div>
                  <pre className="json-output">{jsonOutput}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="image-export">
            <div className="section">
              <h3>Image Export</h3>
              <p className="description">
                Export the selected node as images in multiple formats for
                visual verification and regression testing.
              </p>

              <div className="settings">
                <h4>Export Formats</h4>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={exportSettings.png}
                    onChange={(e) => setExportSettings({
                      ...exportSettings, 
                      png: e.target.checked
                    })}
                  />
                  PNG
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={exportSettings.svg}
                    onChange={(e) => setExportSettings({
                      ...exportSettings, 
                      svg: e.target.checked
                    })}
                  />
                  SVG
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={exportSettings.jpg}
                    onChange={(e) => setExportSettings({
                      ...exportSettings, 
                      jpg: e.target.checked
                    })}
                  />
                  JPG
                </label>

                <h4>Export Scale</h4>
                <div className="scale-selector">
                  {[1, 2, 4].map(scale => (
                    <button
                      key={scale}
                      className={`scale-button ${exportSettings.scale === scale ? 'active' : ''}`}
                      onClick={() => setExportSettings({ ...exportSettings, scale })}
                    >
                      {scale}x
                    </button>
                  ))}
                </div>
              </div>

              <button 
                className="primary-button"
                onClick={handleExportImages}
                disabled={!canExport || loading || (!exportSettings.png && !exportSettings.svg && !exportSettings.jpg)}
              >
                {loading ? 'Exporting...' : 'Export Images'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
