import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY = process.env.HEYGEN_API_KEY;
  
  if (!API_KEY) {
    return NextResponse.json({ error: "HEYGEN_API_KEY missing" }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.heygen.com/v2/voices', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Api-Key': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HeyGen voices API error:', errorText);
      return NextResponse.json({ error: "Failed to fetch voices" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching HeyGen voices:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

