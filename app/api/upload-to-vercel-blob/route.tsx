import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { BASE_URL } from "@/constants/constants";

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

        console.log({ pathname, clientPayload });

        if (!clientPayload) {
          throw new Error("Client payload not found");
        }

        const { userId, ownerAddress, driveAddress } =
          JSON.parse(clientPayload);

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
            userId,
            driveAddress,
            ownerAddress,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // ⚠️ This will not work on `localhost` websites,
        // Use ngrok or similar to get the full upload flow

        try {
          // Run any logic after the file upload completed
          if (!tokenPayload) {
            throw new Error("Token payload not found");
          }
          const { userId, driveAddress, ownerAddress } =
            JSON.parse(tokenPayload);
          // await db.update({ avatar: blob.url, userId });
          const { url, pathname, contentType, contentDisposition } = blob;

          console.log("fetching blob", {
            url,
            pathname,
            contentType,
            contentDisposition,
          });

          const formData = new FormData();

          formData.append("url", url);
          formData.append("driveAddress", driveAddress);
          formData.append("ownerAddress", ownerAddress);

          const res = await fetch(
            `${BASE_URL}/api/upload-files-to-shadow-drive`,
            {
              method: "POST",
              body: formData,
            }
          );

          await del(url);
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
