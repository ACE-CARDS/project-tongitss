// Same logic as thesis

'use client';

import { useState } from 'react';

export default function SurveyDescription({ description }: { description: string | null }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!description) {
    return <p className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed min-h-[63px]">
      No description available
    </p>;
  }

  if (description.length <= 200) {
    return <p className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed min-h-[63px] break-words overflow-wrap-anywhere">
      {description}
    </p>;
  }

  return (
    <div>
      {!isOpen ? (
        <div className="flex flex-end flex-col mb-2">
          <p className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed line-clamp-3 break-words overflow-wrap-anywhere">
            {description}
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="text-[#0d21a1] text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors ml-auto"
          >
            Read more
          </button>
        </div>
      ) : (
        <div className="flex flex-end flex-col mb-2">
          <div className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed max-h-48 overflow-y-auto pr-2 break-words overflow-wrap-anywhere custom-scrollbar-blue">
            {description}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#0d21a1] text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors ml-auto"
          >
            Read less
          </button>
        </div>
      )}
    </div>
  );
}