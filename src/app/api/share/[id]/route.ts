import { getDirectusInstance } from "@/services/cms-api-service";
import { createItem, readItem, updateItem } from "@directus/sdk";
import { NextResponse } from "next/server";

const shareTrackingMap = new Map<string, Set<string>>();

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
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

        console.log(`Counting view for ID: ${id}, IP: ${ip}, Date: ${today}`);
        await getDirectusInstance().request(createItem("track_shares", { 
            episode: id
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