const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST() {
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from .env");
    }
    const baseApiUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

    // For development, disable SSL verification to handle self-signed certificates
    const fetchOptions: any = {
      method: "POST",
      headers: {
        "x-api-key": HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
    };

    // Only disable SSL verification in development
    if (process.env.NODE_ENV === 'development') {
      // Use a custom agent that ignores SSL errors
      const { Agent } = await import('https');
      fetchOptions.agent = new Agent({
        rejectUnauthorized: false
      });
    }

    const res = await fetch(`${baseApiUrl}/v1/streaming.create_token`, fetchOptions);

    console.log("Response:", res);

    const data = await res.json();

    return new Response(data.data.token, {
      status: 200,
    });
  } catch (error) {
    console.error("Error retrieving access token:", error);

    return new Response("Failed to retrieve access token", {
      status: 500,
    });
  }
}
