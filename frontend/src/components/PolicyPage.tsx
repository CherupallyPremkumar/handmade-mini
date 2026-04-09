import type { Policy } from '@/lib/policies';

interface PolicyPageProps {
  policy: Policy | null;
  fallbackTitle: string;
}

export default function PolicyPage({ policy, fallbackTitle }: PolicyPageProps) {
  if (!policy) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="font-display text-3xl font-bold text-bark mb-2">{fallbackTitle}</h1>
        <div className="gold-divider mb-8" />
        <p className="font-body text-bark-light">
          This policy is being updated. Please check back soon or contact us at{' '}
          <a href="mailto:ch.dhanunjaiah@gmail.com" className="text-maroon underline">
            ch.dhanunjaiah@gmail.com
          </a>
          .
        </p>
      </div>
    );
  }

  const updated = new Date(policy.updatedTime).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-bold text-bark mb-2">{policy.title}</h1>
      <div className="gold-divider mb-8" />
      <p className="font-ui text-xs text-bark-light/50 mb-8">Last updated: {updated}</p>

      <div
        className="prose-policy"
        dangerouslySetInnerHTML={{ __html: policy.content }}
      />
    </div>
  );
}
