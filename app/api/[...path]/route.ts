import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ path: string[] }>
}

function apiBase() {
  return (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '')
}

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  const target = `${apiBase()}/api/${path.join('/')}${request.nextUrl.search}`

  const headers = new Headers()
  const authorization = request.headers.get('authorization')
  const contentType = request.headers.get('content-type')
  if (authorization) headers.set('authorization', authorization)
  if (contentType) headers.set('content-type', contentType)

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
    cache: 'no-store',
    redirect: 'manual',
  })

  const responseHeaders = new Headers()
  const upstreamType = upstream.headers.get('content-type')
  if (upstreamType) responseHeaders.set('content-type', upstreamType)

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
