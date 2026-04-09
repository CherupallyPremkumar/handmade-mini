const API = process.env.NEXT_PUBLIC_API_URL || '';

export interface Policy {
  slug: string;
  title: string;
  metaDescription: string | null;
  content: string;
  updatedTime: string;
}

export async function getPolicy(slug: string): Promise<Policy | null> {
  try {
    const res = await fetch(`${API}/api/policies/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getAllPolicies(): Promise<Policy[]> {
  try {
    const res = await fetch(`${API}/api/policies`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
