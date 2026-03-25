// RevenueCat integration placeholder — replace with actual SDK calls.
// Install: npx expo install react-native-purchases

export const ENTITLEMENTS = {
  PREMIUM: "premium",
  PRO_FEATURES: "pro_features",
} as const;

export type Entitlement = (typeof ENTITLEMENTS)[keyof typeof ENTITLEMENTS];

export async function initRevenueCat(_userId: string): Promise<void> {
  // Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_KEY! });
  // Purchases.logIn(userId);
  console.warn("[RevenueCat] SDK not yet configured. Placeholder active.");
}

export async function checkEntitlement(_entitlement: Entitlement): Promise<boolean> {
  // const info = await Purchases.getCustomerInfo();
  // return entitlement in info.entitlements.active;
  return false;
}

export async function purchasePackage(_packageId: string): Promise<boolean> {
  // const offerings = await Purchases.getOfferings();
  // await Purchases.purchasePackage(pkg);
  return false;
}
