import { NextResponse } from 'next/server';
import { obtenerFuente } from '@/lib/desastres/datos';
export const dynamic = 'force-dynamic';
export async function GET() {
  const [usgs,eonet]=await Promise.all([obtenerFuente('usgs'),obtenerFuente('eonet')]);
  return NextResponse.json({usgs,eonet},{headers:{'Cache-Control':'no-store'}});
}
