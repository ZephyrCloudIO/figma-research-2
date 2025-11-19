import React from 'react';

/**
 * Item component - A documentation page layout with header, playground, and footer sections
 */
interface ItemProps {
  className?: string;
}

export const Item: React.FC<ItemProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col bg-white ${className}`}>
      {/* Container */}
      <div className="flex flex-col items-center gap-16 py-32 bg-white">
        {/* Docs Header */}
        <div className="flex flex-row items-start justify-center gap-16">
          <div className="flex flex-col gap-2">
            {/* Title */}
            <div className="flex flex-row items-start justify-center bg-white border border-[#E5E5E5]">
              <div className="flex flex-row items-center justify-center gap-2 px-4 py-4">
                <span className="text-sm">Typography</span>
                <div className="flex items-center gap-2">
                  {/* Docs Link - Developer */}
                  <div className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  {/* Docs Link - Designer */}
                  <div className="w-4 h-4" />
                </div>
                <span className="text-sm">Components</span>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-row items-start justify-center bg-white border border-[#E5E5E5]">
              <div className="flex flex-row items-start justify-start gap-2 px-4 py-4">
                <span className="text-sm text-left">
                  Styles for typography elements such as headings, paragraphs, lists that are used within the rich text.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Playground */}
        <div className="flex flex-col items-center gap-4">
          {/* Title */}
          <div className="flex flex-row items-start justify-center gap-2 px-4 bg-white">
            <div className="flex flex-row items-center justify-center gap-4 px-4">
              <h2 className="text-xl font-semibold text-[#0A0A0A]">Playground</h2>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center gap-4 border border-[#E5E5E5]">
            <div className="flex flex-col items-start gap-4 p-4 bg-[#F5F5F5] bg-opacity-40">
              {/* Light Theme */}
              <div className="flex flex-col items-center justify-center gap-16 px-4 py-32 bg-white border border-[#E5E5E5] rounded-2xl shadow-sm">
                {/* Item instances would go here */}
                <div className="w-full h-8 bg-gray-100 rounded" />
                <div className="w-full h-8 bg-gray-100 rounded" />
                <div className="w-full h-8 bg-gray-100 rounded" />
                <div className="w-full h-8 bg-gray-100 rounded" />
                <div className="w-full h-8 bg-gray-100 rounded" />
                <div className="w-full h-8 bg-gray-100 rounded" />
                <div className="w-full h-8 bg-gray-100 rounded" />
                <div className="w-full h-8 bg-gray-100 rounded" />
                <div className="w-full h-8 bg-gray-100 rounded" />
                <div className="w-full h-8 bg-gray-100 rounded" />
                <div className="w-full h-8 bg-gray-100 rounded" />
                <div className="w-full h-8 bg-gray-100 rounded" />
              </div>

              {/* Dark Theme */}
              <div className="flex flex-col items-center justify-center gap-16 px-4 py-32 bg-[#0A0A0A] border border-white rounded-2xl shadow-sm">
                {/* Item instances would go here */}
                <div className="w-full h-8 bg-gray-800 rounded" />
                <div className="w-full h-8 bg-gray-800 rounded" />
                <div className="w-full h-8 bg-gray-800 rounded" />
                <div className="w-full h-8 bg-gray-800 rounded" />
                <div className="w-full h-8 bg-gray-800 rounded" />
                <div className="w-full h-8 bg-gray-800 rounded" />
                <div className="w-full h-8 bg-gray-800 rounded" />
                <div className="w-full h-8 bg-gray-800 rounded" />
                <div className="w-full h-8 bg-gray-800 rounded" />
                <div className="w-full h-8 bg-gray-800 rounded" />
                <div className="w-full h-8 bg-gray-800 rounded" />
                <div className="w-full h-8 bg-gray-800 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-row items-start justify-center gap-16 pt-16">
          <div className="flex flex-row items-start justify-center gap-2 bg-white border border-[#E5E5E5]">
            <div className="flex flex-row items-center justify-between gap-2 px-4 py-4">
              <span className="text-lg text-[#737373]">© 2025 shadcndesign.com</span>
              <div className="flex flex-row items-center justify-center gap-8">
                <span className="text-lg text-[#737373]">Docs</span>
                <span className="text-lg text-[#737373]">Licensing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Container Line */}
      <div className="w-full h-px border-t border-[#E5E5E5]" />
    </div>
  );
};

export default Item;