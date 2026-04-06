'use client';

import type { OrderStatus } from '@/lib/types';
import { formatStatus } from '@/lib/format';

interface StatusTimelineProps {
  currentStatus: OrderStatus;
}

const TIMELINE_STEPS: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'SHIPPED',
  'DELIVERED',
];

export default function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200">
        <svg
          className="w-8 h-8 text-red-500 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className="font-ui font-semibold text-red-700">
            Order Cancelled
          </p>
          <p className="font-ui text-sm text-red-600">
            This order has been cancelled.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = TIMELINE_STEPS.indexOf(currentStatus);

  return (
    <div className="relative">
      {TIMELINE_STEPS.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step} className="flex gap-4">
            {/* Connector */}
            <div className="flex flex-col items-center">
              {/* Dot */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  transition-all duration-500
                  ${
                    isCurrent
                      ? 'bg-maroon ring-4 ring-maroon/20'
                      : isCompleted
                        ? 'bg-sage'
                        : 'bg-cream-deep border-2 border-cream-deep'
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-bark-light/30" />
                )}
              </div>

              {/* Line */}
              {index < TIMELINE_STEPS.length - 1 && (
                <div
                  className={`
                    w-0.5 h-12
                    ${isCompleted && index < currentIndex ? 'bg-sage' : 'bg-cream-deep'}
                  `}
                />
              )}
            </div>

            {/* Label */}
            <div className="pt-1 pb-8">
              <p
                className={`
                  font-ui text-sm font-medium
                  ${isCurrent ? 'text-maroon' : isCompleted ? 'text-bark' : 'text-bark-light/50'}
                `}
              >
                {formatStatus(step)}
              </p>
              {isCurrent && (
                <p className="font-ui text-xs text-bark-light mt-0.5">
                  Current status
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
