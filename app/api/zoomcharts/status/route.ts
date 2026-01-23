import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const statusResponse = {
    bannerImage: 'https://cdn.zoomcharts-cloud.com/assets/sdk/for-charts-zoomcharts-unlicensed.jpg',
    bannerTarget: 'https://zoomcharts.com/en/javascript-charts-library/pricing/invalid_licence',
    consoleMessages: [],
    protocol: 1,
    status: 1,
    url_method: 'normal',
  };

  return NextResponse.json(statusResponse, { status: 200 });
}
