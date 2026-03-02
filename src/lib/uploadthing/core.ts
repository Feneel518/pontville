import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import z from "zod";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  restaurantImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({}))
    .middleware(async ({ req }) => {
      // 🔒 OPTIONAL: add admin auth check here
      return { userId: "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        url: file.url,
      };
    }),
  menuImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({}))
    .middleware(async ({ req }) => {
      // 🔒 OPTIONAL: add admin auth check here
      return { userId: "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        url: file.url,
      };
    }),
  menuItemImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({}))
    .middleware(async ({ req }) => {
      // 🔒 OPTIONAL: add admin auth check here
      return { userId: "admin" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        url: file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
