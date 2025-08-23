// app/api/settings/license/route.js
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import License from "@/app/models/License";

export async function GET() {
  try {
    await connectToDatabase();
    let license = await License.findOne();

    if (!license) {
      license = await License.create({
        licenseText: "Default license text here..."
      });
    }

    return NextResponse.json({ licenseText: license.licenseText });
  } catch (error) {
    console.error("Error fetching license:", error);
    return NextResponse.json(
      { error: "Failed to fetch license" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const { licenseText } = await req.json();

    let license = await License.findOne();

    if (!license) {
      license = await License.create({ licenseText });
    } else {
      license.licenseText = licenseText;
      await license.save();
    }

    return NextResponse.json({
      success: true,
      licenseText: license.licenseText
    });
  } catch (error) {
    console.error("Error saving license:", error);
    return NextResponse.json(
      { error: "Failed to save license" },
      { status: 500 }
    );
  }
}
