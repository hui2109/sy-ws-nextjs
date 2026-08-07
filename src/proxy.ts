import {NextRequest, NextResponse} from "next/server";
import {verifySessionToken} from "@/api/SessionToken/session";

const PUBLIC_PATHS = ["/login", "/forget"];

export async function proxy(request: NextRequest) {
    const {pathname} = request.nextUrl;

    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    const token = request.cookies.get("session")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = await verifySessionToken(token);

    if (!session) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("session");
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|map)$).*)",
    ],
};
