'use client';

interface SuccessMessageBannerProps {
  message: string | null;
}

export default function SuccessMessageBanner({ message }: SuccessMessageBannerProps) {
  if (!message) return null;

  return (
    <div className="px-4 py-3 bg-green-50 border-b border-green-200">
      <div className="flex items-center gap-2 text-green-800">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
