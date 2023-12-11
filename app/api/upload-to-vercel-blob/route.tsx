import { createBlueprintClient } from "@/app/blueprint/client";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import axios from "axios";
import { NextResponse } from "next/server";
import fs from "fs";
import { User } from "@nhost/nextjs";
import { client } from "@/graphql/backend-client";
import { GET_USER_BY_ID } from "@/graphql/queries/get-user-by-id";
import { del } from "@vercel/blob";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  const { BLOB_READ_WRITE_TOKEN } = process.env;

  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN not found");
  }

  console.log({ body, BLOB_READ_WRITE_TOKEN });

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (
        pathname: string,
        clientPayload?: string
      ) => {
        // Generate a client token for the browser to upload the file
        // ⚠️ Authenticate and authorize users before generating the token.
        // Otherwise, you're allowing anonymous uploads.

        const blueprint = createBlueprintClient({
          cluster: "devnet",
        });

        console.log({ pathname, clientPayload });

        if (!clientPayload) {
          throw new Error("Client payload not found");
        }

        // const { userId, ownerAddress, driveAddress } =
        //   JSON.parse(clientPayload);

        // const { users_by_pk: users }: { users_by_pk: User[] } =
        //   await client.request({
        //     document: GET_USER_BY_ID,
        //     variables: {
        //       id: userId,
        //     },
        //   });

        // console.log({ users });

        // if (!users?.[0]?.id) {
        //   throw new Error("User not found");
        // }

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/svg+xml",
            "application/zip",
          ],
          tokenPayload: JSON.stringify({
            // optional, sent to your server on upload completion
            // you could pass a user id from auth, or a value from clientPayload
            message: "Upload to vercel blob completed -- tokenPayload",
            pathname,
            // userId: users[0].id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // ⚠️ This will not work on `localhost` websites,
        // Use ngrok or similar to get the full upload flow

        try {
          // Run any logic after the file upload completed
          // const { userId } = JSON.parse(tokenPayload);
          // await db.update({ avatar: blob.url, userId });
          const { url, pathname, contentType, contentDisposition } = blob;

          console.log("fetching blob", {
            url,
            pathname,
            contentType,
            contentDisposition,
          });

          const file = await axios.get(url, {
            responseType: "arraybuffer",
          });

          console.log({ file });

          const blueprint = createBlueprintClient({
            cluster: "devnet",
          });

          const { success, urls, count } = await blueprint.uploadFiles({
            driveAddress: "6EAWakDFnyKDW4cezXvBZBYyStFdV8UzKfNcgkbd7QMi",
            files: [
              {
                file: Buffer.from(file.data),
                name: pathname,
              },
            ],
          });

          await del(pathname);

          if (!success) {
            throw new Error("Could not upload file");
          }

          console.log({ success, urls, count });
        } catch (error) {
          throw new Error("Could not upload file");
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 } // The webhook will retry 5 times waiting for a 200
    );
  }
}
