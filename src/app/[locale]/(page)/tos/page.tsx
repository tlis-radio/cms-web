import React from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getTranslations } from "next-intl/server";

export default async function TosPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'TosPage' });

  const breadcrumbs = [
    { label: t('breadcrumb'), href: `/${locale}/tos` }
  ];

  return (
    <>
      <div className="px-8 mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      
      <h1 className="text-4xl text-white font-semibold mb-8 text-left ml-8">
        <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> 
        {t('title')}
      </h1>

      <div className="max-w-4xl mx-auto px-4 py-8 text-white bg-black/50 rounded-lg">
        <div className="flex flex-col gap-8 items-center">
          <div className="space-y-4 order-2 md:order-1">
            <div className="font-argentumSansRegular text-lg leading-relaxed">
              <p><strong>1. {t('sections.ownership.title')}</strong></p>
              <p>{t('sections.ownership.content')}</p>
            </div>

            <div className="font-argentumSansRegular text-lg leading-relaxed">
              <p><strong>2. {t('sections.sharing.title')}</strong></p>
              <p>{t('sections.sharing.content')}</p>
            </div>

            <div className="font-argentumSansRegular text-lg leading-relaxed">
              <p><strong>3. {t('sections.responsibility.title')}</strong></p>
              <p>{t('sections.responsibility.content')}</p>
            </div>

            <div className="font-argentumSansRegular text-lg leading-relaxed">
              <p><strong>4. {t('sections.changes.title')}</strong></p>
              <p>{t('sections.changes.content')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}