import { z } from 'zod';

// Weather validation schemas
export const WeatherRequestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  altitude: z.number().min(0).max(10000).optional(),
});

export const WeatherDetailsSchema = z.object({
  air_temperature: z.number().min(-100).max(100),
  relative_humidity: z.number().min(0).max(100).optional(),
  wind_speed: z.number().min(0).max(200).optional(),
  wind_direction: z.number().min(0).max(360).optional(),
  air_pressure_at_sea_level: z.number().min(800).max(1100).optional(),
});

export const WeatherSummarySchema = z.object({
  symbol_code: z.string().min(1).max(50),
  symbol_confidence: z.string().optional(),
});

export const WeatherTimeseriesDataSchema = z.object({
  instant: z.object({
    details: WeatherDetailsSchema,
  }),
  next_1_hours: z
    .object({
      summary: WeatherSummarySchema,
    })
    .optional(),
  next_6_hours: z
    .object({
      summary: WeatherSummarySchema,
    })
    .optional(),
  next_12_hours: z
    .object({
      summary: WeatherSummarySchema,
    })
    .optional(),
});

export const WeatherTimeseriesSchema = z.object({
  time: z.string().datetime(),
  data: WeatherTimeseriesDataSchema,
});

export const WeatherPropertiesSchema = z.object({
  meta: z.object({
    updated_at: z.string().datetime(),
    units: z.record(z.string()),
  }),
  timeseries: z.array(WeatherTimeseriesSchema).min(1),
});

export const WeatherResponseSchema = z.object({
  type: z.literal('Feature'),
  geometry: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number(), z.number()]),
  }),
  properties: WeatherPropertiesSchema,
});

export const ProcessedWeatherDataSchema = z.object({
  temperature: z.number().min(-100).max(100),
  symbol: z.string().min(1).max(50),
  humidity: z.number().min(0).max(100).optional(),
  windSpeed: z.number().min(0).max(200).optional(),
  windDirection: z.number().min(0).max(360).optional(),
  pressure: z.number().min(800).max(1100).optional(),
  updatedAt: z.string().datetime(),
});

// Type exports
export type WeatherRequest = z.infer<typeof WeatherRequestSchema>;
export type WeatherDetails = z.infer<typeof WeatherDetailsSchema>;
export type WeatherSummary = z.infer<typeof WeatherSummarySchema>;
export type WeatherTimeseriesData = z.infer<typeof WeatherTimeseriesDataSchema>;
export type WeatherTimeseries = z.infer<typeof WeatherTimeseriesSchema>;
export type WeatherProperties = z.infer<typeof WeatherPropertiesSchema>;
export type WeatherResponse = z.infer<typeof WeatherResponseSchema>;
export type ProcessedWeatherData = z.infer<typeof ProcessedWeatherDataSchema>;
