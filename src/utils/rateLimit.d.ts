declare module "@/utils/rateLimit" {
  const rateLimit: (request: Request) => Promise<void>;
  export default rateLimit;
}
