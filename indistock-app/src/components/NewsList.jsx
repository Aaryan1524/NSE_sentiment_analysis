import React from 'react';

const NewsList = ({ headlines = [] }) => {
  return (
    <div className="w-full max-w-2xl bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden flex flex-col">
      <div className="p-4 border-b border-[#30363d] bg-[#161b22]">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
          </svg>
          Latest News
        </h3>
      </div>

      <div className="max-h-[500px] overflow-y-auto custom-scrollbar bg-[#0d1117]">
        {headlines.length === 0 ? (
          <div className="p-10 text-center text-gray-500 italic">
            No news items found. Search for a ticker to see results.
          </div>
        ) : (
          <div className="divide-y divide-[#30363d]">
            {headlines.map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 hover:bg-[#161b22] transition-colors cursor-pointer group"
              >
                <h4 className="text-gray-200 font-medium group-hover:text-blue-400 mb-2 leading-snug flex items-start gap-2">
                  <span className="flex-1">{item.title}</span>
                  <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </h4>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="bg-[#30363d] px-2 py-0.5 rounded text-gray-300">
                    {item.source}
                  </span>
                  <span>{item.time}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {headlines.length > 0 && (
        <div className="p-3 border-t border-[#30363d] bg-[#161b22] text-center text-xs text-gray-500">
          Click any headline to read the full article
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0d1117;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }
      `}</style>
    </div>
  );
};

export default NewsList;
