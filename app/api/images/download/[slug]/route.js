import ImageModel from "@/app/models/Image";
import connectToDatabase from "@/lib/db";
import JSZip from "jszip";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import userModel from "@/app/models/userModel";
import Transaction from "@/app/models/transactionModel";
import License from "@/app/models/License";

export async function GET(request, { params }) {
  try {
    const cookieHeader = request.headers.get("cookie");
    console.log("Cookie header:", cookieHeader);
  } catch (err) {
    console.log("Error reading cookie header:", err);
  }

  let session = await getServerSession(authOptions);
  console.log("Session:", session);

  // 🔹 Custom JWT fallback
  if (!session?.user) {
    try {
      const cookieHeader = request.headers.get("cookie") || "";
      const tokenMatch = cookieHeader.match(/token=([^;]+)/);
      if (tokenMatch) {
        const jwtToken = tokenMatch[1];
        const { verifyJWT } = await import("@/lib/jwt");
        const decoded = await verifyJWT(jwtToken);
        if (decoded && decoded.id) {
          session = { user: { id: decoded.id, role: decoded.role } };
        }
      }
    } catch (err) {
      console.log("Custom JWT fallback error:", err);
    }
  }

  if (!session?.user) {
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

  // 🔹 Premium check
  if (image.type === "premium") {
    const user = await userModel.findById(session.user.id);
    const now = new Date();
    const activeTransactions = await Transaction.find({
      userId: user._id,
      expiresAt: { $gt: now },
    });

    if (activeTransactions.length === 0) {
      return new Response(
        JSON.stringify({ error: "Premium access required" }),
        {
          status: 403,
        }
      );
    }
  }

  const downloadUrl = image.downloadUrl || image.imageUrl;
  if (!downloadUrl) {
    return new Response(JSON.stringify({ error: "Download URL missing" }), {
      status: 404,
    });
  }

  try {
    let fileBuffer;

    if (/^https?:\/\//i.test(downloadUrl)) {
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch remote file" }),
          {
            status: 502,
          }
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

    const zip = new JSZip();
    const safeTitle = image.title.replace(/\s+/g, "_");
    const extension =
      image.downloadFileType ||
      path.extname(downloadUrl).replace(".", "") ||
      "jpg";
    const fileName = `${safeTitle}.${extension}`;

    zip.file(fileName, fileBuffer);

    // 🔹 Fetch license from DB (latest saved one)
    const licenseDoc = await License.findOne().sort({ updatedAt: -1 });
    const licenseText =
      licenseDoc?.text ||
      `LICENSE AGREEMENT

Copyright © ${new Date().getFullYear()} Vecteno.com. All rights reserved.

Default license: You may use this asset in personal and commercial projects,
but redistribution or resale is prohibited.`;

    // Add LICENSE.txt
    zip.file("LICENSE.txt", licenseText);

    const zipContent = await zip.generateAsync({ type: "uint8array" });

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
