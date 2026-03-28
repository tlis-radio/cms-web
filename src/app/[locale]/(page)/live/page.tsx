import Breadcrumbs from "@/components/Breadcrumbs";
import StreamVideoHub from "@/components/stream/StreamVideoHub";
import CmsApiService from "@/services/cms-api-service";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "Live Video & Archive | Radio TLIS",
    description: "Sleduj živé video vysielanie Radio TLIS a prehrávaj archívne záznamy zo streamu.",
    alternates: {
      canonical: `${SITE_URL}/${locale}/live`,
    },
    openGraph: {
      title: "Live Video & Archive | Radio TLIS",
      description: "Live stream a video archív Radio TLIS na jednom mieste.",
      url: `${SITE_URL}/${locale}/live`,
      siteName: "Radio TLIS",
      locale: locale === "sk" ? "sk_SK" : "en_US",
    },
  };
}

export default async function LiveVideoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const [currentVideoStream, allVideoStreams] = await Promise.all([
    CmsApiService.Stream.getCurrentVideoStream().catch(() => null),
    CmsApiService.Stream.listVideoStreams().catch(() => []),
  ]);

  const breadcrumbs = [
    { label: "Live Video", href: `/${locale}/live` },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-8">
      <div className="mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <h1 className="text-4xl text-white font-semibold mb-8 text-left">
        <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span>
        live video
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
