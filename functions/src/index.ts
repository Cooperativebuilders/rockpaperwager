import * as functions from "firebase-functions";
import {parse} from "url";
import next from "next";

// Get the path to the Next.js standalone output
// This path is relative to the functions directory
const NEXT_DIST_DIR = "../.next/standalone";

// Create a Next.js app instance
// The 'dev' parameter is false for production builds
const nextApp = next({
  dev: false,
  conf: {},
  dir: NEXT_DIST_DIR,
});

const nextRequestHandler = nextApp.getRequestHandler();

export const ssr = functions.https.onRequest(async (req, res) => {
  await nextApp.prepare(); // Ensure Next.js app is prepared
  const parsedUrl = parse(req.url, true);
  await nextRequestHandler(req, res, parsedUrl);
});
