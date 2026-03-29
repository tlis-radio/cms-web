import Breadcrumbs from "@/components/Breadcrumbs";
import StreamVideoHub from "@/components/stream/StreamVideoHub";
import CmsApiService from "@/services/cms-api-service";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales, toOgLocale } from "@/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LivePage" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${SITE_URL}/${locale}/tlistv`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}/tlistv`])
      ),
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescriptionOg"),
      url: `${SITE_URL}/${locale}/tlistv`,
      siteName: "Radio TLIS",
      locale: toOgLocale(locale),
    },
  };
}

export default async function LiveVideoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LivePage" });

  const [currentVideoStream, allVideoStreams] = await Promise.all([
    CmsApiService.Stream.getCurrentVideoStream().catch(() => null),
    CmsApiService.Stream.listVideoStreams().catch(() => []),
  ]);

  const breadcrumbs = [
    { label: t("breadcrumb_label"), href: `/${locale}/tlistv` },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-8">
      <div className="mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <h1 className="text-4xl text-white font-semibold mb-8 text-left">
        <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span>
        {t("heading")}
      </h1>

      <StreamVideoHub
        liveFlvBaseUrl={process.env.NEXT_PUBLIC_VIDEO_STREAM_BASE_URL || ""}
        currentStream={currentVideoStream}
        streams={allVideoStreams}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";
