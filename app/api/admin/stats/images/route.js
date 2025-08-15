import connectToDatabase from "@/lib/db";
import ImageModel from "@/app/models/Image";
import dayjs from "dayjs";

export async function GET() {
  try {
    await connectToDatabase();

    const last12Months = Array.from({ length: 12 }, (_, i) =>
      dayjs().subtract(i, "month").startOf("month").toDate()
    ).reverse();

    const data = await Promise.all(
      last12Months.map(async (startDate, i) => {
        const endDate =
          i === last12Months.length - 1
            ? new Date()
            : dayjs(last12Months[i + 1]).startOf("month").toDate();

        const count = await ImageModel.countDocuments({
          createdAt: { $gte: startDate, $lt: endDate },
        });

        return {
          month: dayjs(startDate).format("MMM YYYY"),
          count,
        };
      })
    );

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
