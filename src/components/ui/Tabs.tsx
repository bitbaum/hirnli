'use client';

import { useState, useId } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  children: (activeTab: string) => React.ReactNode;
  className?: string;
}

export default function Tabs({ tabs, defaultTab, children, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');
  const instanceId = useId();

  const tabId = (id: string) => `${instanceId}-tab-${id}`;
  const panelId = (id: string) => `${instanceId}-panel-${id}`;

  return (
    <div className={className}>
      <div className="flex gap-1 border-b border-border" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={tabId(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId(tab.id)}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-11 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isActive
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-text-light hover:text-grey-dark'
              }`}
            >
              {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        id={panelId(activeTab)}
        role="tabpanel"
        aria-labelledby={tabId(activeTab)}
        className="pt-4"
      >
        {children(activeTab)}
      </div>
    </div>
  );
}
