import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ path: string[] }>
}

function apiBase() {
  const configured = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
  if (configured) return configured
  if (process.env.NODE_ENV === 'production') {
    throw new Error('API_URL is not configured')
  }
  return 'http://localhost:4000'
}

async function proxy(request: NextRequest, context: RouteContext) {
  let target = 'unknown'
  try {
    const { path } = await context.params
    target = `${apiBase()}/api/${path.join('/')}${request.nextUrl.search}`

    const headers = new Headers()
    const authorization = request.headers.get('authorization')
    const contentType = request.headers.get('content-type')
    if (authorization) headers.set('authorization', authorization)
    if (contentType) headers.set('content-type', contentType)

    const method = request.method
    const body = method === 'GET' || method === 'HEAD' ? undefined : await request.arrayBuffer()
    const upstream = await fetch(target, {
      method,
      headers,
      body,
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'API is unavailable.'
    console.error('API proxy failed', target, message)
    return Response.json({ error: 'API is unavailable.' }, { status: 502 })
  }
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
