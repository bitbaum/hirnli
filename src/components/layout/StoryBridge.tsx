import Link from 'next/link';
import type { StoryBridge as StoryBridgeType } from '@/lib/config/story-bridges';

interface StoryBridgeProps {
  bridges: StoryBridgeType[];
}

/**
 * StoryBridge - Bottom-of-page navigation showing related pages
 *
 * Ground Truth #1 (Serve humans): Shows WHY to visit each related page
 * Ground Truth #3 (Design for change): Creates narrative flow between pages
 *
 * Enables readers to "connect all dots" without using main nav
 */
export default function StoryBridge({ bridges }: StoryBridgeProps) {
  if (bridges.length === 0) {
    return null;
  }

  const gridCols = bridges.length === 2
    ? 'md:grid-cols-2'
    : bridges.length === 3
    ? 'md:grid-cols-3'
    : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
      <div className="mb-6 text-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Weitere Zusammenhänge erkunden
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Verbinde alle Punkte – folge der Geschichte
        </p>
      </div>

      <div className={`grid grid-cols-1 gap-4 ${gridCols}`}>
        {bridges.map((bridge) => (
          <Link
            key={bridge.href}
            href={bridge.href}
            className="group block rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
          >
            <div className="flex items-start gap-3">
              {bridge.icon && (
                <div
                  className="flex-shrink-0 text-2xl transition-transform group-hover:scale-110"
                  aria-hidden="true"
                >
                  {bridge.icon}
                </div>
              )}
              <div className="flex-1">
                <div className="mb-1 font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                  {bridge.title}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {bridge.reason}
                </div>
              </div>
              <div className="flex-shrink-0 text-blue-500 opacity-0 transition-opacity group-hover:opacity-100">
                →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
