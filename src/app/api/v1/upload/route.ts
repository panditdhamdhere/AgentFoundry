import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/ipfs";

/**
 * POST /api/v1/upload
 * Upload an image file to IPFS.
 * Content-Type: multipart/form-data
 * Form field: file (required)
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Use form field 'file'." },
        { status: 400 }
      );
    }

    const { cid, ipfsUri } = await uploadImage(file);

    return NextResponse.json({ cid, ipfsUri });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload",
      },
      { status: 500 }
    );
  }
}
