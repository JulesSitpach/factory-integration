import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import EmergencyCostCalculator from './page.client';

// Generate metadata for the page with proper title and description
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Calculator' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

// Emergency Cost Calculator page component
export default async function CalculatorPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // Get translations for the calculator page
  const t = await getTranslations({ locale, namespace: 'Calculator' });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page content */}
      <EmergencyCostCalculator />
    </div>
  );
}
