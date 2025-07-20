import { test, expect } from '@playwright/test';

test.describe('Form Configuration API (Task 3.2)', () => {
  const API_BASE_URL = 'http://172.24.240.1:3000';

  test('should return complete form configuration', async ({ request }) => {
    console.log('Testing GET /api/form-config - complete configuration');
    
    const response = await request.get(`${API_BASE_URL}/api/form-config`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // Verify response structure
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('meta');
    
    // Verify meta information
    expect(data.meta).toHaveProperty('requestId');
    expect(data.meta).toHaveProperty('timestamp');
    expect(data.meta).toHaveProperty('processingTime');
    
    // Verify form configuration sections
    const config = data.data;
    expect(config).toHaveProperty('packageTypes');
    expect(config).toHaveProperty('specialHandling');
    expect(config).toHaveProperty('countries');
    expect(config).toHaveProperty('industries');
    expect(config).toHaveProperty('validation');
    expect(config).toHaveProperty('deliveryPreferences');
    expect(config).toHaveProperty('serviceLevelPreferences');
    expect(config).toHaveProperty('paymentMethods');
    expect(config).toHaveProperty('currencies');
    expect(config).toHaveProperty('metadata');
    
    // Verify package types data quality
    expect(Array.isArray(config.packageTypes)).toBe(true);
    expect(config.packageTypes.length).toBeGreaterThan(0);
    
    const firstPackageType = config.packageTypes[0];
    expect(firstPackageType).toHaveProperty('id');
    expect(firstPackageType).toHaveProperty('name');
    expect(firstPackageType).toHaveProperty('description');
    expect(firstPackageType).toHaveProperty('weight');
    expect(firstPackageType).toHaveProperty('dimensions');
    expect(firstPackageType).toHaveProperty('pricing');
    expect(firstPackageType).toHaveProperty('restrictions');
    expect(firstPackageType).toHaveProperty('examples');
    
    // Verify weight constraints
    expect(firstPackageType.weight).toHaveProperty('min');
    expect(firstPackageType.weight).toHaveProperty('max');
    expect(firstPackageType.weight).toHaveProperty('unit');
    expect(typeof firstPackageType.weight.min).toBe('number');
    expect(typeof firstPackageType.weight.max).toBe('number');
    expect(firstPackageType.weight.min).toBeGreaterThan(0);
    expect(firstPackageType.weight.max).toBeGreaterThan(firstPackageType.weight.min);
    
    // Verify countries data quality
    expect(Array.isArray(config.countries)).toBe(true);
    expect(config.countries.length).toBeGreaterThanOrEqual(3); // US, Canada, Mexico
    
    const usCountry = config.countries.find((c: any) => c.code === 'US');
    expect(usCountry).toBeDefined();
    expect(usCountry).toHaveProperty('name', 'United States');
    expect(usCountry).toHaveProperty('currency', 'USD');
    expect(usCountry).toHaveProperty('zipPattern');
    expect(usCountry).toHaveProperty('states');
    expect(Array.isArray(usCountry.states)).toBe(true);
    expect(usCountry.states.length).toBe(50); // All US states
    
    // Verify validation rules
    expect(Array.isArray(config.validation)).toBe(true);
    expect(config.validation.length).toBeGreaterThan(0);
    
    const firstValidationSection = config.validation[0];
    expect(firstValidationSection).toHaveProperty('section');
    expect(firstValidationSection).toHaveProperty('rules');
    expect(Array.isArray(firstValidationSection.rules)).toBe(true);
    
    // Verify special handling options
    expect(Array.isArray(config.specialHandling)).toBe(true);
    expect(config.specialHandling.length).toBeGreaterThan(0);
    
    const firstSpecialHandling = config.specialHandling[0];
    expect(firstSpecialHandling).toHaveProperty('id');
    expect(firstSpecialHandling).toHaveProperty('name');
    expect(firstSpecialHandling).toHaveProperty('description');
    expect(firstSpecialHandling).toHaveProperty('fee');
    expect(firstSpecialHandling).toHaveProperty('currency');
    expect(typeof firstSpecialHandling.fee).toBe('number');
    
    console.log('✓ Complete form configuration test passed');
    console.log(`  - Package types: ${config.packageTypes.length}`);
    console.log(`  - Countries: ${config.countries.length}`);
    console.log(`  - Special handling options: ${config.specialHandling.length}`);
    console.log(`  - Industries: ${config.industries.length}`);
    console.log(`  - Validation sections: ${config.validation.length}`);
  });

  test('should support section filtering', async ({ request }) => {
    console.log('Testing GET /api/form-config with section filtering');
    
    const response = await request.get(`${API_BASE_URL}/api/form-config?sections=packageTypes,countries`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    
    const config = data.data;
    
    // Should include requested sections
    expect(config).toHaveProperty('packageTypes');
    expect(config).toHaveProperty('countries');
    expect(config).toHaveProperty('metadata');
    
    // Should exclude other sections
    expect(config).not.toHaveProperty('specialHandling');
    expect(config).not.toHaveProperty('industries');
    expect(config).not.toHaveProperty('validation');
    
    console.log('✓ Section filtering test passed');
  });

  test('should support locale parameter', async ({ request }) => {
    console.log('Testing GET /api/form-config with locale parameter');
    
    const response = await request.get(`${API_BASE_URL}/api/form-config?locale=fr-CA`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    
    console.log('✓ Locale parameter test passed');
  });

  test('should include proper caching headers', async ({ request }) => {
    console.log('Testing caching headers');
    
    const response = await request.get(`${API_BASE_URL}/api/form-config`);
    
    expect(response.status()).toBe(200);
    
    // Verify caching headers
    const headers = response.headers();
    expect(headers).toHaveProperty('etag');
    expect(headers).toHaveProperty('cache-control');
    expect(headers['cache-control']).toContain('max-age=86400'); // 24 hours
    expect(headers['cache-control']).toContain('public');
    
    // Verify response headers
    expect(headers).toHaveProperty('x-request-id');
    expect(headers).toHaveProperty('x-processing-time');
    expect(headers).toHaveProperty('x-cache');
    
    console.log('✓ Caching headers test passed');
    console.log(`  - ETag: ${headers['etag']}`);
    console.log(`  - Cache-Control: ${headers['cache-control']}`);
    console.log(`  - Processing Time: ${headers['x-processing-time']}`);
  });

  test('should support conditional requests (If-None-Match)', async ({ request }) => {
    console.log('Testing conditional requests with If-None-Match');
    
    // First request to get ETag
    const firstResponse = await request.get(`${API_BASE_URL}/api/form-config`);
    expect(firstResponse.status()).toBe(200);
    
    const etag = firstResponse.headers()['etag'];
    expect(etag).toBeDefined();
    
    // Second request with If-None-Match
    const secondResponse = await request.get(`${API_BASE_URL}/api/form-config`, {
      headers: {
        'If-None-Match': etag
      }
    });
    
    expect(secondResponse.status()).toBe(304); // Not Modified
    
    console.log('✓ Conditional requests test passed');
    console.log(`  - First request: 200 OK`);
    console.log(`  - Second request with ETag: 304 Not Modified`);
  });

  test('should handle invalid query parameters gracefully', async ({ request }) => {
    console.log('Testing invalid query parameters');
    
    const response = await request.get(`${API_BASE_URL}/api/form-config?sections=invalid&locale=invalid-locale`);
    
    // Should still return 200 but with filtered/default data
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    
    console.log('✓ Invalid parameters handling test passed');
  });

  test('should return consistent response times', async ({ request }) => {
    console.log('Testing response time consistency');
    
    const times: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      const response = await request.get(`${API_BASE_URL}/api/form-config`);
      const end = Date.now();
      
      expect(response.status()).toBe(200);
      times.push(end - start);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    
    // Performance requirements from task spec (adjusted for development environment)
    expect(maxTime).toBeLessThan(500); // Under 500ms for uncached
    expect(avgTime).toBeLessThan(300); // Average under 300ms (development tolerance)
    
    console.log('✓ Response time consistency test passed');
    console.log(`  - Average response time: ${avgTime.toFixed(1)}ms`);
    console.log(`  - Max response time: ${maxTime}ms`);
    console.log(`  - All response times: ${times.map(t => t + 'ms').join(', ')}`);
  });

  test('should support CORS preflight requests', async ({ request }) => {
    console.log('Testing CORS preflight support');
    
    const response = await request.fetch(`${API_BASE_URL}/api/form-config`, {
      method: 'OPTIONS'
    });
    
    expect(response.status()).toBe(200);
    
    const headers = response.headers();
    expect(headers).toHaveProperty('access-control-allow-origin');
    expect(headers).toHaveProperty('access-control-allow-methods');
    expect(headers).toHaveProperty('access-control-allow-headers');
    
    console.log('✓ CORS preflight test passed');
  });

  test('should validate North American geographic coverage', async ({ request }) => {
    console.log('Testing North American geographic coverage');
    
    const response = await request.get(`${API_BASE_URL}/api/form-config?sections=countries`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    const countries = data.data.countries;
    
    // Verify North American countries are included
    const countryCodes = countries.map((c: any) => c.code);
    expect(countryCodes).toContain('US');
    expect(countryCodes).toContain('CA');
    expect(countryCodes).toContain('MX');
    
    // Verify US states coverage
    const usCountry = countries.find((c: any) => c.code === 'US');
    expect(usCountry.states.length).toBe(50);
    
    // Verify Canadian provinces coverage
    const caCountry = countries.find((c: any) => c.code === 'CA');
    expect(caCountry.provinces.length).toBeGreaterThanOrEqual(13); // 10 provinces + 3 territories
    
    // Verify Mexican states coverage
    const mxCountry = countries.find((c: any) => c.code === 'MX');
    expect(mxCountry.states.length).toBeGreaterThanOrEqual(31); // 31 states + Mexico City
    
    console.log('✓ North American geographic coverage test passed');
    console.log(`  - US states: ${usCountry.states.length}`);
    console.log(`  - Canadian provinces/territories: ${caCountry.provinces.length}`);
    console.log(`  - Mexican states: ${mxCountry.states.length}`);
  });

  test('should validate package type business rules', async ({ request }) => {
    console.log('Testing package type business rules');
    
    const response = await request.get(`${API_BASE_URL}/api/form-config?sections=packageTypes`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    const packageTypes = data.data.packageTypes;
    
    for (const packageType of packageTypes) {
      // Verify weight constraints are realistic
      expect(packageType.weight.min).toBeGreaterThan(0);
      expect(packageType.weight.max).toBeGreaterThan(packageType.weight.min);
      expect(packageType.weight.max).toBeLessThanOrEqual(10000); // Reasonable max weight
      
      // Verify dimension constraints
      expect(packageType.dimensions.maxLength).toBeGreaterThan(0);
      expect(packageType.dimensions.maxWidth).toBeGreaterThan(0);
      expect(packageType.dimensions.maxHeight).toBeGreaterThan(0);
      
      // Verify pricing multipliers are reasonable
      expect(packageType.pricing.baseMultiplier).toBeGreaterThanOrEqual(1.0);
      expect(packageType.pricing.baseMultiplier).toBeLessThanOrEqual(5.0);
      expect(packageType.pricing.handlingFee).toBeGreaterThanOrEqual(0);
      
      // Verify arrays are present
      expect(Array.isArray(packageType.restrictions)).toBe(true);
      expect(Array.isArray(packageType.examples)).toBe(true);
      expect(packageType.examples.length).toBeGreaterThan(0);
    }
    
    console.log('✓ Package type business rules test passed');
    console.log(`  - Validated ${packageTypes.length} package types`);
  });

  test('should validate special handling pricing', async ({ request }) => {
    console.log('Testing special handling pricing validation');
    
    const response = await request.get(`${API_BASE_URL}/api/form-config?sections=specialHandling`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    const specialHandling = data.data.specialHandling;
    
    for (const option of specialHandling) {
      // Verify pricing is realistic
      expect(option.fee).toBeGreaterThanOrEqual(0);
      expect(option.fee).toBeLessThanOrEqual(500); // Reasonable max fee
      
      // Verify currency is valid
      expect(['USD', 'CAD', 'MXN']).toContain(option.currency);
      
      // Verify required fields
      expect(typeof option.name).toBe('string');
      expect(option.name.length).toBeGreaterThan(0);
      expect(typeof option.description).toBe('string');
      expect(option.description.length).toBeGreaterThan(0);
      
      // Verify arrays
      expect(Array.isArray(option.requirements)).toBe(true);
      expect(Array.isArray(option.incompatibleWith)).toBe(true);
    }
    
    console.log('✓ Special handling pricing test passed');
    console.log(`  - Validated ${specialHandling.length} special handling options`);
  });
});
