import { NextRequest, NextResponse } from "next/server";

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!HEYGEN_API_KEY) {
      return NextResponse.json(
        { error: "HEYGEN_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: {
        "X-API-KEY": HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HeyGen API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to create streaming token" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({ token: data.data.token });
  } catch (error) {
    console.error("Error creating streaming token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}