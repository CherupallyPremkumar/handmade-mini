import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';
import { getPolicy } from '@/lib/policies';

export async function generateMetadata(): Promise<Metadata> {
  const policy = await getPolicy('return-policy');
  return {
    title: policy?.title || 'Return & Refund Policy',
    description: policy?.metaDescription || 'Return and refund policy for Dhanunjaiah Handlooms.',
  };
}

export default async function ReturnPolicyPageRoute() {
  const policy = await getPolicy('return-policy');
  return <PolicyPage policy={policy} fallbackTitle="Return & Refund Policy" />;
}
