import { openApiSpec } from "../../../../lib/openapi";

export async function GET() {
  return new Response(JSON.stringify(openApiSpec, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}
