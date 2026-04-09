import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';
import { getPolicy } from '@/lib/policies';

export async function generateMetadata(): Promise<Metadata> {
  const policy = await getPolicy('privacy-policy');
  return {
    title: policy?.title || 'Privacy Policy',
    description: policy?.metaDescription || 'Privacy policy for Dhanunjaiah Handlooms.',
  };
}

export default async function PrivacyPolicyPageRoute() {
  const policy = await getPolicy('privacy-policy');
  return <PolicyPage policy={policy} fallbackTitle="Privacy Policy" />;
}
