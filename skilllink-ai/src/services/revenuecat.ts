export async function checkRevenueCatEntitlement(userId: string): Promise<boolean> {
  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_REVENUECAT_SECRET_KEY}`,
    },
  });

  const data = await res.json();
  return data?.subscriber?.entitlements?.premium?.is_active === true;
}
