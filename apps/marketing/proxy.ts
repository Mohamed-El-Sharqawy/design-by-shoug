import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const protocol = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");

  if (host.startsWith("www.")) {
    const nonWwwHost = host.replace(/^www\./, "");
    const url = new URL(`${protocol}://${nonWwwHost}${pathname}${search}`);
    return NextResponse.redirect(url, 301);
  }

  if (protocol === "http" && !host.startsWith("localhost")) {
    const url = new URL(`https://${host}${pathname}${search}`);
    return NextResponse.redirect(url, 301);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
