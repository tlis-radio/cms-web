import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.redirect(
        'https://docs.google.com/forms/d/e/1FAIpQLSfENP1vGmJ9JaLeAII2sbF2WFvL9wcode0ZtRAAPRWOSwIr9Q/viewform',
        308
    );
}