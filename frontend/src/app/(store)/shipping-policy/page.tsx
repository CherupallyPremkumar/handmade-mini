import type { Metadata } from 'next';
import PolicyPage from '@/components/PolicyPage';
import { getPolicy } from '@/lib/policies';

export async function generateMetadata(): Promise<Metadata> {
  const policy = await getPolicy('shipping-policy');
  return {
    title: policy?.title || 'Shipping Policy',
    description: policy?.metaDescription || 'Shipping information for Dhanunjaiah Handlooms.',
  };
}

export default async function ShippingPolicyPageRoute() {
  const policy = await getPolicy('shipping-policy');
  return <PolicyPage policy={policy} fallbackTitle="Shipping Policy" />;
}
