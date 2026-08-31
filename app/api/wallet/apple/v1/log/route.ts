export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[applepass-log]", JSON.stringify(body?.logs ?? body));
  } catch {
    /* ignore */
  }
  return new Response(null, { status: 200 });
}
