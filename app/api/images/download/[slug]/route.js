import ImageModel from "@/app/models/Image";
import connectToDatabase from "@/lib/db";
import JSZip from "jszip";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request, { params }) {
  // ✅ Auth check
  const session = await getServerSession(request, authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { slug } = params;
  await connectToDatabase();

  const image = await ImageModel.findOne({ slug });
  if (!image) {
    return new Response(JSON.stringify({ error: "Image not found" }), {
      status: 404,
    });
  }

  const downloadUrl = image.downloadUrl || image.imageUrl;
  if (!downloadUrl) {
    return new Response(JSON.stringify({ error: "Download URL missing" }), {
      status: 404,
    });
  }

  try {
    let fileBuffer;

    // Remote vs Local
    if (/^https?:\/\//i.test(downloadUrl)) {
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch remote file" }),
          { status: 502 }
        );
      }
      fileBuffer = Buffer.from(await res.arrayBuffer());
    } else {
      const relativePath = downloadUrl.startsWith("/api/uploads/")
        ? downloadUrl.replace("/api/uploads/", "")
        : downloadUrl;

      const fullPath = path.join(process.cwd(), "storage", relativePath);

      if (!fs.existsSync(fullPath)) {
        return new Response(JSON.stringify({ error: "Local file not found" }), {
          status: 404,
        });
      }
      fileBuffer = fs.readFileSync(fullPath);
    }

    // ZIP preparation
    const zip = new JSZip();
    const safeTitle = image.title.replace(/\s+/g, "_");
    const extension =
      image.downloadFileType ||
      path.extname(downloadUrl).replace(".", "") ||
      "jpg";
    const fileName = `${safeTitle}.${extension}`;

    zip.file(fileName, fileBuffer);

    zip.file(
      "LICENSE.txt",
      `LICENSE AGREEMENT

Copyright © ${new Date().getFullYear()} Vecteno.com. All rights reserved.

Permission is granted to use this asset in personal and commercial projects,
subject to the following conditions:

1. You may use and modify the asset.
2. You may include the asset in derivative works.
3. You may NOT resell or redistribute the asset in its original form.
4. You may NOT claim ownership of the original asset.
`
    );

    const zipContent = await zip.generateAsync({ type: "uint8array" });

    // Increment downloads
    await ImageModel.updateOne({ _id: image._id }, { $inc: { downloads: 1 } });

    return new Response(zipContent, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeTitle}.zip"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
