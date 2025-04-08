// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Giả định bạn có hàm verifyToken với TypeScript
async function verifyToken(token: string): Promise<boolean> {
  // Triển khai logic xác thực token của bạn ở đây
  return true // hoặc false tùy vào kết quả xác thực
}

export async function middleware(request: NextRequest) {

  // const response = NextResponse.next();
  
  // // Thêm CORS headers
  // response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000');
  // response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  // response.headers.set('Access-Control-Allow-Credentials', 'true');

  const token = request.cookies.get('authToken')?.value
  const { pathname } = request.nextUrl

  // Các route không cần xác thực
  const publicPaths: string[] = ['/login', '/register', '/forgot-password']
  
  // Nếu đang truy cập route công khai và đã đăng nhập, chuyển hướng về trang chính
  if (publicPaths.includes(pathname)) {
    if (token && await verifyToken(token)) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Nếu không có token hoặc token không hợp lệ, chuyển hướng về trang login
  if (!token || !(await verifyToken(token))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Cấu hình matcher cho middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 