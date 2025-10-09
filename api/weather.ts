import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  WeatherRequestSchema,
  WeatherResponseSchema,
} from '../src/app/schemas';

const MET_NO_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Validate query parameters with Zod
    const validationResult = WeatherRequestSchema.safeParse({
      lat: req.query.lat ? Number(req.query.lat) : undefined,
      lon: req.query.lon ? Number(req.query.lon) : undefined,
      altitude: req.query.altitude ? Number(req.query.altitude) : undefined,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
        return `${path}${err.message}`;
      });
      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    const { lat, lon, altitude } = validationResult.data;

    const url = new URL(MET_NO_URL);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    if (altitude !== undefined)
      url.searchParams.set('altitude', String(altitude));

    const response = await fetch(url.toString(), {
      headers: {
        // required by yr.no TOS
        'User-Agent':
          'Planner Dash (https://planner-dash.vercel.app, annette.liv.aune@gmail.com)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `Upstream error ${response.status}` });
    }

    const data = await response.json();

    // Validate response data with Zod
    const responseValidation = WeatherResponseSchema.safeParse(data);
    if (!responseValidation.success) {
      console.error(
        'Invalid weather response format:',
        responseValidation.error
      );
      return res
        .status(500)
        .json({ error: 'Invalid response format from weather service' });
    }

    return res.status(200).json(responseValidation.data);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
