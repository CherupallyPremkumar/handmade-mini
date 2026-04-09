import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';
import { getPolicy } from '@/lib/policies';

export async function generateMetadata(): Promise<Metadata> {
  const policy = await getPolicy('terms-and-conditions');
  return {
    title: policy?.title || 'Terms & Conditions',
    description: policy?.metaDescription || 'Terms and conditions for Dhanunjaiah Handlooms.',
  };
}

export default async function TermsPageRoute() {
  const policy = await getPolicy('terms-and-conditions');
  return <PolicyPage policy={policy} fallbackTitle="Terms & Conditions" />;
}
