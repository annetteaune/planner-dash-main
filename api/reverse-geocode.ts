import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  ReverseGeocodeQuerySchema,
  ReverseGeocodeResultSchema,
} from '../src/app/schemas';

/*
 * converts coords to place names
 */

const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

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
    const validationResult = ReverseGeocodeQuerySchema.safeParse({
      lat: req.query.lat,
      lon: req.query.lon,
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

    const { lat, lon } = validationResult.data;

    const url = new URL(NOMINATIM_REVERSE_URL);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');

    const response = await fetch(url.toString(), {
      headers: {
        // Required by Nominatim usage policy: identify application and contact
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
    const responseValidation = ReverseGeocodeResultSchema.safeParse(data);
    if (!responseValidation.success) {
      console.error(
        'Invalid reverse geocode response format:',
        responseValidation.error
      );
      return res
        .status(500)
        .json({
          error: 'Invalid response format from reverse geocoding service',
        });
    }

    return res.status(200).json(responseValidation.data);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
