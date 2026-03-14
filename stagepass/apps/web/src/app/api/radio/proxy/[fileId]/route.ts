import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/radio/proxy/[fileId]?t=DRIVE_ACCESS_TOKEN
 * Server-side proxy that fetches a Google Drive audio file and streams it back
 * to the browser. This bypasses CORS restrictions on Drive URLs.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const { fileId } = params;
  const token = req.nextUrl.searchParams.get("t");

  if (!fileId) {
    return NextResponse.json({ error: "fileId required" }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ error: "Drive token required" }, { status: 401 });
  }

  try {
    // Fetch the file from Google Drive using the user's access token
    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!driveRes.ok) {
      // Token might have expired — return a specific code so frontend can refresh
      if (driveRes.status === 401) {
        return NextResponse.json({ error: "token_expired" }, { status: 401 });
      }
      return NextResponse.json(
        { error: `Drive fetch failed: ${driveRes.status}` },
        { status: driveRes.status }
      );
    }

    const contentType = driveRes.headers.get("content-type") || "audio/mpeg";
    const contentLength = driveRes.headers.get("content-length");

    // Stream back to client
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    };
    if (contentLength) headers["Content-Length"] = contentLength;

    return new NextResponse(driveRes.body, { status: 200, headers });
  } catch (err: any) {
    console.error("[radio/proxy]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
