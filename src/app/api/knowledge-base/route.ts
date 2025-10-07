import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const API_KEY = process.env.HEYGEN_API_KEY;
  if (!API_KEY) return NextResponse.json({ error: "HEYGEN_API_KEY missing" }, { status: 500 });

  try {
    const { name, content } = await req.json();
    
    // Create knowledge base
    const createRes = await fetch("https://api.heygen.com/v1/knowledge_base.create", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "X-API-KEY": API_KEY 
      },
      body: JSON.stringify({
        name: name || "Persona Knowledge Base",
        description: "Knowledge base for social work simulation persona",
        content: content || "This is a social work simulation persona. Please respond as a helpful social worker character."
      }),
    });

    if (!createRes.ok) {
      const error = await createRes.text();
      return NextResponse.json({ error: `Failed to create knowledge base: ${error}` }, { status: createRes.status });
    }

    const result = await createRes.json();
    return NextResponse.json({ knowledgeBaseId: result.data?.id || result.id });
  } catch (error) {
    console.error("Knowledge base creation error:", error);
    return NextResponse.json({ error: "Failed to create knowledge base" }, { status: 500 });
  }
}
