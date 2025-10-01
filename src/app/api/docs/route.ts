import { openApiSpec } from "../../../../lib/openapiSpec";

export async function GET() {
  return new Response(JSON.stringify(openApiSpec, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}
