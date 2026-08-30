import React from 'react';

export type SkeletonVariant = 
  | 'flows' 
  | 'analytics' 
  | 'inbox' 
  | 'contacts' 
  | 'triggers' 
  | 'broadcast' 
  | 'settings' 
  | 'generic';

interface SkeletonScreenProps {
  variant?: SkeletonVariant;
  label?: string;
}

export const SkeletonScreen: React.FC<SkeletonScreenProps> = ({ 
  variant = 'generic', 
  label 
}) => {
  return (
    <div 
      className="flex-1 w-full h-full min-h-[400px] overflow-hidden bg-[#F8F9FB] flex flex-col p-6 animate-pulse select-none"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Dynamic Header Skeleton */}
      <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#E2E8F0]">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-[#E2E8F0] rounded-lg" />
          <div className="h-3.5 w-72 bg-[#EEF2F6] rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-24 bg-[#E2E8F0] rounded-xl" />
          <div className="h-8 w-32 bg-[#E2E8F0] rounded-xl" />
        </div>
      </div>

      {/* Render Specific Skeleton based on active tab / variant */}
      {variant === 'flows' && <FlowCanvasSkeleton />}
      {variant === 'analytics' && <AnalyticsSkeleton />}
      {variant === 'inbox' && <InboxSkeleton />}
      {variant === 'contacts' && <ContactsSkeleton />}
      {variant === 'triggers' && <CardsGridSkeleton />}
      {variant === 'broadcast' && <CardsGridSkeleton />}
      {variant === 'settings' && <SettingsSkeleton />}
      {variant === 'generic' && <GenericSkeleton />}

      {/* Subtle Perceived Performance Toast / Badge */}
      {label && (
        <div className="mt-auto pt-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-xs text-xs font-semibold text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-[#0084FF] animate-ping" />
            <span>{label}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 1. FLOW CANVAS SKELETON (Visual Node Editor Grid)
const FlowCanvasSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex gap-5 overflow-hidden">
      {/* Left Node Palette Sidebar Skeleton */}
      <div className="w-64 shrink-0 bg-white rounded-2xl border border-[#E2E8F0] p-4 flex flex-col gap-3 shadow-xs">
        <div className="h-4 w-28 bg-[#E2E8F0] rounded-md mb-1" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-3 rounded-xl border border-[#F1F5F9] bg-[#F8F9FB] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E2E8F0] shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-20 bg-[#E2E8F0] rounded" />
              <div className="h-2.5 w-28 bg-[#EEF2F6] rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Canvas Area with Simulated Visual Nodes & Connections */}
      <div className="flex-1 rounded-2xl border border-[#E2E8F0] bg-white p-6 relative overflow-hidden flex flex-col justify-between shadow-xs">
        {/* Top Floating Mini Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-28 bg-[#F1F5F9] rounded-xl" />
            <div className="h-8 w-20 bg-[#F1F5F9] rounded-xl" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#F1F5F9] rounded-lg" />
            <div className="h-8 w-8 bg-[#F1F5F9] rounded-lg" />
            <div className="h-8 w-8 bg-[#F1F5F9] rounded-lg" />
          </div>
        </div>

        {/* Node 1: Trigger / Starting Step */}
        <div className="absolute top-16 left-12 w-72 p-4 rounded-2xl bg-white border-2 border-[#E2E8F0] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-purple-200" />
              <div className="h-3.5 w-24 bg-[#E2E8F0] rounded" />
            </div>
            <div className="h-4 w-12 bg-purple-100 rounded-full" />
          </div>
          <div className="h-10 bg-[#F8F9FB] rounded-xl border border-[#F1F5F9]" />
          <div className="flex justify-end">
            <div className="w-3.5 h-3.5 rounded-full bg-[#0084FF]/40" />
          </div>
        </div>

        {/* Node 2: Message / Card Step */}
        <div className="absolute top-28 left-[380px] w-80 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-200" />
              <div className="h-3.5 w-28 bg-[#E2E8F0] rounded" />
            </div>
            <div className="h-4 w-14 bg-blue-100 rounded-full" />
          </div>
          <div className="h-16 bg-[#F8F9FB] rounded-xl border border-[#F1F5F9] p-2 space-y-2">
            <div className="h-3 w-44 bg-[#E2E8F0] rounded" />
            <div className="h-3 w-32 bg-[#EEF2F6] rounded" />
          </div>
          <div className="space-y-1.5">
            <div className="h-7 bg-[#F1F5F9] rounded-lg" />
            <div className="h-7 bg-[#F1F5F9] rounded-lg" />
          </div>
        </div>

        {/* Node 3: Condition / Action Step */}
        <div className="absolute top-52 left-[740px] w-72 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-emerald-200" />
              <div className="h-3.5 w-24 bg-[#E2E8F0] rounded" />
            </div>
            <div className="h-4 w-12 bg-emerald-100 rounded-full" />
          </div>
          <div className="h-10 bg-[#F8F9FB] rounded-xl border border-[#F1F5F9]" />
        </div>

        {/* Bottom Zoom / Canvas Controls */}
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="h-7 w-32 bg-[#F1F5F9] rounded-lg" />
          <div className="h-7 w-24 bg-[#F1F5F9] rounded-lg" />
        </div>
      </div>
    </div>
  );
};

// 2. ANALYTICS & DASHBOARD SKELETON
const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className="space-y-5">
      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-[#EEF2F6] rounded" />
              <div className="w-7 h-7 rounded-lg bg-[#F1F5F9]" />
            </div>
            <div className="h-7 w-28 bg-[#E2E8F0] rounded-lg" />
            <div className="h-3 w-36 bg-[#EEF2F6] rounded" />
          </div>
        ))}
      </div>

      {/* Main Chart Card + Secondary Funnel Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 bg-[#E2E8F0] rounded" />
            <div className="h-7 w-28 bg-[#F1F5F9] rounded-lg" />
          </div>
          {/* Chart Bars Skeleton */}
          <div className="h-60 bg-[#F8F9FB] rounded-xl border border-[#F1F5F9] p-4 flex items-end justify-between gap-3">
            {[40, 65, 85, 50, 95, 70, 80, 60, 90, 75, 88, 62].map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-[#E2E8F0] rounded-t-md transition-all" 
                  style={{ height: `${height}%` }} 
                />
                <div className="h-2 w-4 bg-[#EEF2F6] rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Funnel / Conversion Stage Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="h-4 w-32 bg-[#E2E8F0] rounded" />
          <div className="space-y-3 pt-2">
            {[100, 78, 54, 38].map((width, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <div className="h-3 w-20 bg-[#EEF2F6] rounded" />
                  <div className="h-3 w-10 bg-[#E2E8F0] rounded" />
                </div>
                <div className="h-3.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#E2E8F0] rounded-full" 
                    style={{ width: `${width}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. INBOX / LIVE CHAT SKELETON
const InboxSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex gap-5 overflow-hidden">
      {/* Left Conversations Sidebar */}
      <div className="w-80 shrink-0 bg-white rounded-2xl border border-[#E2E8F0] p-4 flex flex-col gap-3 shadow-xs">
        <div className="h-9 bg-[#F8F9FB] rounded-xl border border-[#E2E8F0] mb-2" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-3 rounded-xl border border-[#F1F5F9] bg-[#F8F9FB] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E2E8F0] shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3.5 w-24 bg-[#E2E8F0] rounded" />
                <div className="h-2.5 w-10 bg-[#EEF2F6] rounded" />
              </div>
              <div className="h-2.5 w-36 bg-[#EEF2F6] rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Chat Conversation View */}
      <div className="flex-1 rounded-2xl border border-[#E2E8F0] bg-white p-5 flex flex-col justify-between shadow-xs">
        {/* Chat Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E2E8F0]" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 bg-[#E2E8F0] rounded" />
              <div className="h-2.5 w-16 bg-[#EEF2F6] rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-[#F1F5F9] rounded-lg" />
            <div className="h-8 w-20 bg-[#F1F5F9] rounded-lg" />
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 py-6 space-y-4 flex flex-col justify-end">
          {/* User Message (Left) */}
          <div className="flex items-start gap-2.5 max-w-[65%]">
            <div className="w-7 h-7 rounded-full bg-[#E2E8F0] shrink-0" />
            <div className="p-3.5 rounded-2xl rounded-tl-xs bg-[#F8F9FB] border border-[#F1F5F9] space-y-1.5 w-56">
              <div className="h-3 w-40 bg-[#E2E8F0] rounded" />
              <div className="h-3 w-28 bg-[#EEF2F6] rounded" />
            </div>
          </div>

          {/* Bot Response (Right) */}
          <div className="flex items-start gap-2.5 max-w-[65%] self-end flex-row-reverse">
            <div className="w-7 h-7 rounded-full bg-blue-200 shrink-0" />
            <div className="p-3.5 rounded-2xl rounded-tr-xs bg-blue-50 border border-blue-100 space-y-1.5 w-64">
              <div className="h-3 w-48 bg-blue-200 rounded" />
              <div className="h-3 w-36 bg-blue-100 rounded" />
            </div>
          </div>

          {/* User Message 2 (Left) */}
          <div className="flex items-start gap-2.5 max-w-[65%]">
            <div className="w-7 h-7 rounded-full bg-[#E2E8F0] shrink-0" />
            <div className="p-3.5 rounded-2xl rounded-tl-xs bg-[#F8F9FB] border border-[#F1F5F9] space-y-1.5 w-48">
              <div className="h-3 w-36 bg-[#E2E8F0] rounded" />
            </div>
          </div>
        </div>

        {/* Chat Input Footer */}
        <div className="pt-3 border-t border-[#F1F5F9] flex items-center gap-3">
          <div className="flex-1 h-10 bg-[#F8F9FB] rounded-xl border border-[#E2E8F0]" />
          <div className="w-10 h-10 rounded-xl bg-[#E2E8F0]" />
        </div>
      </div>
    </div>
  );
};

// 4. CONTACTS CRM / TABLE SKELETON
const ContactsSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
      {/* Table Action Controls */}
      <div className="flex items-center justify-between gap-4 pb-2">
        <div className="h-9 w-72 bg-[#F8F9FB] rounded-xl border border-[#E2E8F0]" />
        <div className="flex gap-2.5">
          <div className="h-9 w-24 bg-[#F8F9FB] rounded-xl border border-[#E2E8F0]" />
          <div className="h-9 w-28 bg-[#E2E8F0] rounded-xl" />
        </div>
      </div>

      {/* Table Header */}
      <div className="h-10 bg-[#F8F9FB] rounded-xl border border-[#F1F5F9] flex items-center px-4 gap-4">
        <div className="h-3.5 w-32 bg-[#E2E8F0] rounded" />
        <div className="h-3.5 w-24 bg-[#E2E8F0] rounded" />
        <div className="h-3.5 w-28 bg-[#E2E8F0] rounded" />
        <div className="h-3.5 w-20 bg-[#E2E8F0] rounded" />
        <div className="h-3.5 w-16 bg-[#E2E8F0] rounded ml-auto" />
      </div>

      {/* Table Rows */}
      <div className="space-y-2.5">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-14 bg-white border border-[#F1F5F9] rounded-xl flex items-center px-4 gap-4 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-[#E2E8F0] shrink-0" />
            <div className="w-36 space-y-1">
              <div className="h-3 w-28 bg-[#E2E8F0] rounded" />
              <div className="h-2.5 w-16 bg-[#EEF2F6] rounded" />
            </div>
            <div className="w-28 h-6 bg-[#F8F9FB] rounded-lg" />
            <div className="w-32 h-3.5 bg-[#EEF2F6] rounded" />
            <div className="w-20 h-6 bg-emerald-50 rounded-lg" />
            <div className="h-7 w-16 bg-[#F1F5F9] rounded-lg ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. CARDS GRID SKELETON (Triggers, Growth Tools, Broadcasts)
const CardsGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E2E8F0]" />
              <div className="space-y-1">
                <div className="h-3.5 w-28 bg-[#E2E8F0] rounded" />
                <div className="h-2.5 w-16 bg-[#EEF2F6] rounded" />
              </div>
            </div>
            <div className="w-8 h-4 rounded-full bg-[#E2E8F0]" />
          </div>
          <div className="h-14 bg-[#F8F9FB] rounded-xl border border-[#F1F5F9] p-3 space-y-1.5">
            <div className="h-3 w-36 bg-[#E2E8F0] rounded" />
            <div className="h-2.5 w-24 bg-[#EEF2F6] rounded" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
            <div className="h-3 w-20 bg-[#EEF2F6] rounded" />
            <div className="h-6 w-16 bg-[#F1F5F9] rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

// 6. SETTINGS & FORMS SKELETON
const SettingsSkeleton: React.FC = () => {
  return (
    <div className="space-y-5">
      {/* Sub Tabs Navigation Skeleton */}
      <div className="flex gap-2 border-b border-[#E2E8F0] pb-2">
        <div className="h-8 w-32 bg-[#E2E8F0] rounded-lg" />
        <div className="h-8 w-36 bg-[#F1F5F9] rounded-lg" />
        <div className="h-8 w-28 bg-[#F1F5F9] rounded-lg" />
      </div>

      {/* Main Settings Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-5">
        <div className="space-y-1.5">
          <div className="h-4 w-44 bg-[#E2E8F0] rounded" />
          <div className="h-3 w-72 bg-[#EEF2F6] rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-28 bg-[#EEF2F6] rounded" />
              <div className="h-10 bg-[#F8F9FB] rounded-xl border border-[#E2E8F0]" />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-[#F1F5F9]">
          <div className="h-9 w-32 bg-[#E2E8F0] rounded-xl" />
        </div>
      </div>
    </div>
  );
};

// 7. GENERIC FALLBACK SKELETON
const GenericSkeleton: React.FC = () => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-white border border-[#E2E8F0] space-y-2">
            <div className="h-3 w-20 bg-[#EEF2F6] rounded" />
            <div className="h-6 w-24 bg-[#E2E8F0] rounded" />
          </div>
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-white border border-[#E2E8F0] p-6 space-y-3">
        <div className="h-4 w-36 bg-[#E2E8F0] rounded" />
        <div className="h-3 w-64 bg-[#EEF2F6] rounded" />
        <div className="h-36 bg-[#F8F9FB] rounded-xl border border-[#F1F5F9] mt-4" />
      </div>
    </div>
  );
};
