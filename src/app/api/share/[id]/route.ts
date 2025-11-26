import { getDirectusInstance } from "@/services/cms-api-service";
import { createItem, readItem, updateItem } from "@directus/sdk";
import { NextResponse } from "next/server";

const shareTrackingMap = new Map<string, Set<string>>();

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const enabled = process.env.TRACKER_ENABLED === 'true';
    if (!enabled) {
        return NextResponse.json(
            { error: 'Tracking is disabled' },
            { status: 403 }
        );
    }
    if (!id) {
        return NextResponse.json(
            { error: 'ID is required' },
            { status: 400 }
        );
    }

    try {
        // TODO: otestovat toto v produkcii, ci funguje
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        const today = new Date().toISOString().split('T')[0];
        const trackingKey = `${id}_${today}`;

        if (shareTrackingMap.has(trackingKey)) {
            const ipSet = shareTrackingMap.get(trackingKey)!;
            if (ipSet.has(ip)) {
                console.log(`Share already counted for IP: ${ip} on ${today}`);
                return NextResponse.json(
                    { success: false, message: 'Share already counted for this IP today' },
                    { status: 200 }
                );
            }
        } else {
            shareTrackingMap.set(trackingKey, new Set<string>());
        }
        shareTrackingMap.get(trackingKey)!.add(ip);

        console.log(`Counting share for ID: ${id}, IP: ${ip}, Date: ${today}`);
        const episode = await getDirectusInstance().request(readItem("Episodes", id, { fields: ['Title'] }));
        await getDirectusInstance().request(createItem("track_shares", {
            episode: id,
            name: episode.Title
        }));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error counting view:", error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic";