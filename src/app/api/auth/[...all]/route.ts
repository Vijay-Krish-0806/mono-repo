// import { toNextJsHandler } from "better-auth/next-js";
// import { auth } from "../../../../../lib/auth";

// export const { GET, POST } = toNextJsHandler(auth);

import { auth } from "../../../../../lib/auth";
 
 
export const GET = auth.handler;
export const POST = auth.handler;