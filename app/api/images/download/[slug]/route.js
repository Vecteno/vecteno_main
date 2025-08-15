import ImageModel from "@/app/models/Image";
import connectToDatabase from "@/lib/db";
import JSZip from "jszip";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export async function GET(request, { params }) {
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

    // Check if the file is local or remote
    if (/^https?:\/\//i.test(downloadUrl)) {
      // Remote file
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch remote file" }),
          { status: 502 }
        );
      }
      fileBuffer = Buffer.from(await res.arrayBuffer());
    } else {
      // Local file

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

    // Prepare ZIP
    const zip = new JSZip();
    const safeTitle = image.title.replace(/\s+/g, "_");
    const extension =
      image.downloadFileType ||
      path.extname(downloadUrl).replace(".", "") ||
      "jpg";
    const fileName = `${safeTitle}.${extension}`;

    // Add main file
    zip.file(fileName, fileBuffer);

    // Add license file
    const COMPANY_NAME = process.env.COMPANY_NAME || "YourCompanyName";
    const WEBSITE_URL = process.env.WEBSITE_URL || "https://yourwebsite.com";
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

    // Increment downloads atomically
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
