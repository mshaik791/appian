(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__c833a009._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/appian/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$appian$2f$node_modules$2f$next$2d$auth$2f$middleware$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/appian/node_modules/next-auth/middleware.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$appian$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/appian/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$appian$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/appian/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$appian$2f$node_modules$2f$next$2d$auth$2f$middleware$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["withAuth"])(function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    // Faculty routes - only FACULTY and ADMIN
    if (pathname.startsWith('/faculty')) {
        if (!token || ![
            'FACULTY',
            'ADMIN'
        ].includes(token.role)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$appian$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', req.url));
        }
    }
    // Student routes - only STUDENT and ADMIN
    if (pathname.startsWith('/student')) {
        if (!token || ![
            'STUDENT',
            'ADMIN'
        ].includes(token.role)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$appian$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', req.url));
        }
    }
    // Admin routes - only ADMIN
    if (pathname.startsWith('/admin')) {
        if (!token || token.role !== 'ADMIN') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$appian$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', req.url));
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$appian$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}, {
    callbacks: {
        authorized: ({ token, req })=>{
            const { pathname } = req.nextUrl;
            // Allow access to login page without authentication
            if (pathname === '/login') {
                return true;
            }
            // Require authentication for all other protected routes
            if (pathname.startsWith('/faculty') || pathname.startsWith('/student') || pathname.startsWith('/admin')) {
                return !!token;
            }
            // Allow access to public routes
            return true;
        }
    }
});
const config = {
    matcher: [
        '/faculty/:path*',
        '/student/:path*',
        '/admin/:path*',
        '/login'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__c833a009._.js.map