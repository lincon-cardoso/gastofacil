export function extractUserId(session: unknown): string | undefined {
  if (!session || typeof session !== "object") return undefined;
  const s = session as Record<string, unknown>;
  // session.user?.id
  if ("user" in s) {
    const user = s.user;
    if (user && typeof user === "object") {
      const u = user as Record<string, unknown>;
      if ("id" in u) {
        const id = u.id;
        if (typeof id === "string") return id;
        if (typeof id === "number") return String(id);
      }
    }
  }
  // session.userId
  if ("userId" in s) {
    const id = s.userId;
    if (typeof id === "string") return id;
    if (typeof id === "number") return String(id);
  }
  // session.id
  if ("id" in s) {
    const id = s.id;
    if (typeof id === "string") return id;
    if (typeof id === "number") return String(id);
  }
  return undefined;
}
