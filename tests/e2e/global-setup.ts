import { server } from "../mocks/server";

export default async function globalSetup() {
  server.listen({ onUnhandledRequest: "bypass" });
}
