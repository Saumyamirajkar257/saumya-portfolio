/**
 * Cloudflare Pages Function for POST /api/certificates/fetch
 * Runs on Cloudflare Edge V8 Runtime with SSRF protection & provider adapters
 */
import { importCredentialFromUrl } from "../../../lib/importers/index.js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json();
    const { url } = body || {};

    if (!url || typeof url !== "string" || !url.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Please enter a valid credential or verification URL.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
          },
        }
      );
    }

    const result = await importCredentialFromUrl(url.trim());

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Couldn't automatically retrieve certificate details.",
        fallbackManual: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS,
        },
      }
    );
  }
}
