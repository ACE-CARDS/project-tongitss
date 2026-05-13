import Link from "next/link";

export default function memberFeatureBanner({feature}: { feature?: string }) {
  return(
    <div className="bg-yellow-50 ring-yellow-300 border-l-yellow-300 border-l-4 p-4 mb-4 shadow-sm rounded-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center flex-1">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 font-ubuntu-mono">
              <strong className="font-oswald font-bold">ACE CARDS Member Feature:</strong>{" "}
              {feature}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Link href="/auth/login" className="bg-[#ca8a04] text-white hover:bg-[#a16207] font-sm text-sm whitespace-nowrap px-4 py-2 rounded-full transition-all duration-200 inline-flex items-center gap-1 shadow-sm hover:shadow">
            <strong>Sign in to submit→</strong>
          </Link>
        </div>
      </div>
    </div>
  )
};