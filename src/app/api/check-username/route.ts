import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "../../../../db/drizzle";
import { users } from "../../../../db/schema";

export async function GET(request: NextRequest) {
  try {
    // Get username from query parameters (not body)
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Check if user with this username exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.name, username))
      .limit(1);

    return NextResponse.json({
      exists: existingUser.length > 0,
    });
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
