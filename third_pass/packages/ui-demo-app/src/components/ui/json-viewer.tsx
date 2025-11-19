import { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { Button } from './button';

interface JsonViewerProps {
  data: any;
  defaultExpanded?: boolean;
  maxHeight?: string;
}

export function JsonViewer({ data, defaultExpanded = false, maxHeight = '600px' }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Full JSON Structure</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy JSON
            </>
          )}
        </Button>
      </div>
      <div
        className="border border-neutral-200 rounded-lg overflow-auto bg-neutral-50 p-4 font-mono text-xs"
        style={{ maxHeight }}
      >
        <JsonNode data={data} name="root" level={0} defaultExpanded={defaultExpanded} />
      </div>
    </div>
  );
}

interface JsonNodeProps {
  data: any;
  name: string;
  level: number;
  defaultExpanded: boolean;
}

function JsonNode({ data, name, level, defaultExpanded }: JsonNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded || level < 2);

  const indent = level * 16;
  const isObject = typeof data === 'object' && data !== null && !Array.isArray(data);
  const isArray = Array.isArray(data);
  const isExpandable = isObject || isArray;

  if (!isExpandable) {
    return (
      <div style={{ marginLeft: indent }}>
        <span className="text-purple-600">{name}</span>
        <span className="text-neutral-500">: </span>
        <span className={getValueColor(data)}>{formatValue(data)}</span>
      </div>
    );
  }

  const keys = Object.keys(data);
  const preview = isArray
    ? `Array(${data.length})`
    : `Object {${keys.length} ${keys.length === 1 ? 'key' : 'keys'}}`;

  return (
    <div>
      <div
        style={{ marginLeft: indent }}
        className="flex items-center gap-1 cursor-pointer hover:bg-neutral-100 -mx-1 px-1 rounded"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3 text-neutral-500" />
        ) : (
          <ChevronRight className="w-3 h-3 text-neutral-500" />
        )}
        <span className="text-purple-600">{name}</span>
        <span className="text-neutral-500">: </span>
        {!expanded && <span className="text-neutral-400 text-xs">{preview}</span>}
      </div>

      {expanded && (
        <div>
          {isArray ? (
            data.map((item: any, index: number) => (
              <JsonNode
                key={index}
                data={item}
                name={`[${index}]`}
                level={level + 1}
                defaultExpanded={defaultExpanded}
              />
            ))
          ) : (
            keys.map((key) => (
              <JsonNode
                key={key}
                data={data[key]}
                name={key}
                level={level + 1}
                defaultExpanded={defaultExpanded}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function getValueColor(value: any): string {
  if (value === null) return 'text-neutral-400';
  if (typeof value === 'boolean') return 'text-blue-600';
  if (typeof value === 'number') return 'text-green-600';
  if (typeof value === 'string') return 'text-orange-600';
  return 'text-neutral-700';
}

function formatValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'boolean') return value.toString();
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
}
