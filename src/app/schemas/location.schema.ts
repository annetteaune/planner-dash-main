import { z } from 'zod';

// Location validation schemas
export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lon: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
});

export const LocationDataSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  shortName: z.string().min(1).max(200),
  displayName: z.string().min(1).max(500).optional(),
  isLiveLocation: z.boolean(),
});

export const GeocodeResultSchema = z.object({
  display_name: z.string(),
  lat: z.string().transform((val) => parseFloat(val)),
  lon: z.string().transform((val) => parseFloat(val)),
  place_id: z.number().optional(),
  type: z.string().optional(),
  importance: z.number().optional(),
});

export const GeocodeResponseSchema = z.array(GeocodeResultSchema);

export const ReverseGeocodeResultSchema = z.object({
  display_name: z.string(),
  address: z
    .object({
      city: z.string().optional(),
      town: z.string().optional(),
      village: z.string().optional(),
      municipality: z.string().optional(),
      county: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  lat: z.string().transform((val) => parseFloat(val)),
  lon: z.string().transform((val) => parseFloat(val)),
});

export const LocationSearchQuerySchema = z.object({
  query: z
    .string()
    .min(2, 'Search query must be at least 2 characters')
    .max(100),
  limit: z.number().min(1).max(10).optional().default(5),
});

export const ReverseGeocodeQuerySchema = z.object({
  lat: z.string().transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num < -90 || num > 90) {
      throw new Error('Invalid latitude');
    }
    return num;
  }),
  lon: z.string().transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num < -180 || num > 180) {
      throw new Error('Invalid longitude');
    }
    return num;
  }),
});

// Type exports
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type LocationData = z.infer<typeof LocationDataSchema>;
export type GeocodeResult = z.infer<typeof GeocodeResultSchema>;
export type GeocodeResponse = z.infer<typeof GeocodeResponseSchema>;
export type ReverseGeocodeResult = z.infer<typeof ReverseGeocodeResultSchema>;
export type LocationSearchQuery = z.infer<typeof LocationSearchQuerySchema>;
export type ReverseGeocodeQuery = z.infer<typeof ReverseGeocodeQuerySchema>;
