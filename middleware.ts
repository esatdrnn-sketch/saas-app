import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*"],
};

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    const encoded = authHeader.slice(6);
    const decoded = atob(encoded);
    const colonIndex = decoded.indexOf(":");

    if (colonIndex !== -1) {
      const username = decoded.slice(0, colonIndex);
      const password = decoded.slice(colonIndex + 1);

      const validUser = process.env.ADMIN_USERNAME ?? "";
      const validPass = process.env.ADMIN_PASSWORD ?? "";

      if (
        validUser &&
        validPass &&
        safeCompare(username, validUser) &&
        safeCompare(password, validPass)
      ) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Yetkisiz erişim.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Paneli"',
    },
  });
}
