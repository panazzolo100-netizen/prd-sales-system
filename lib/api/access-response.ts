import { NextResponse } from "next/server";
import {
  AccessDeniedError,
  AuthenticationRequiredError,
} from "@/lib/auth/access-errors";

export function accessErrorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof AccessDeniedError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  return null;
}
