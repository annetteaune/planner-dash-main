import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  LocationSearchQuerySchema,
  GeocodeResponseSchema,
} from '../src/app/schemas';

/*
 * converts place names to coords
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

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
    const validationResult = LocationSearchQuerySchema.safeParse({
      query: req.query.query,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
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

    const { query, limit } = validationResult.data;

    const url = new URL(NOMINATIM_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '0');
    url.searchParams.set('limit', String(limit ?? 5));

    const response = await fetch(url.toString(), {
      headers: {
        // required by Nominatim TOS
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
    const responseValidation = GeocodeResponseSchema.safeParse(data);
    if (!responseValidation.success) {
      console.error(
        'Invalid geocode response format:',
        responseValidation.error
      );
      return res
        .status(500)
        .json({ error: 'Invalid response format from geocoding service' });
    }

    return res.status(200).json(responseValidation.data);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
