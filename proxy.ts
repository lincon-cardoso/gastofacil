export { middleware } from "./src/proxy";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap.*\\.xml|assets/|images/|favicons/|api/auth/providers|api/auth/session|api/auth/csrf).*)",
  ],
};
