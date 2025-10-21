import { createUploadthing, type FileRouter } from "uploadthing/next";

import { getSession } from "../../../../lib/auth-utils";

const f = createUploadthing();

const handleAuth = async () => {
  const user = await getSession();
  if (!user) throw new Error("Unauthorized");

  return { userId: user.id };
};

export const ourFileRouter = {
  serverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
  messageFile: f(["image", "pdf"])
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
