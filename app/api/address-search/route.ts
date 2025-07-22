import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('AddressSearch API: Request received');
  
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'origin';
  
  console.log('AddressSearch API: Query:', query, 'Type:', type);

  if (!query || query.length < 3) {
    console.log('AddressSearch API: Query too short or missing');
    return NextResponse.json({
      success: false,
      error: 'Query must be at least 3 characters long',
      suggestions: []
    });
  }

  try {
    // Mock address suggestions - in production this would call a real address API
    const mockSuggestions = generateMockSuggestions(query, type);
    
    console.log('AddressSearch API: Generated', mockSuggestions.length, 'suggestions');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    return NextResponse.json({
      success: true,
      suggestions: mockSuggestions,
      query,
      type
    });
  } catch (error) {
    console.error('AddressSearch API: Error generating suggestions:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch address suggestions',
      suggestions: []
    }, { status: 500 });
  }
}

function generateMockSuggestions(query: string, type: string) {
  console.log('AddressSearch: Generating mock suggestions for:', query);
  
  const queryLower = query.toLowerCase();
  
  // Mock addresses database
  const mockAddresses = [
    {
      id: '1',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'US',
      isCommercial: true,
      displayText: '123 Main Street'
    },
    {
      id: '2',
      address: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90210',
      country: 'US',
      isCommercial: false,
      displayText: '456 Oak Avenue'
    },
    {
      id: '3',
      address: '789 Pine Road',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      country: 'US',
      isCommercial: true,
      displayText: '789 Pine Road'
    },
    {
      id: '4',
      address: '321 Elm Street',
      city: 'Houston',
      state: 'TX',
      zip: '77001',
      country: 'US',
      isCommercial: false,
      displayText: '321 Elm Street'
    },
    {
      id: '5',
      address: '654 Cedar Lane',
      city: 'Phoenix',
      state: 'AZ',
      zip: '85001',
      country: 'US',
      isCommercial: true,
      displayText: '654 Cedar Lane'
    },
    {
      id: '6',
      address: '987 Maple Drive',
      city: 'Philadelphia',
      state: 'PA',
      zip: '19101',
      country: 'US',
      isCommercial: false,
      displayText: '987 Maple Drive'
    },
    {
      id: '7',
      address: '147 Birch Boulevard',
      city: 'San Antonio',
      state: 'TX',
      zip: '78201',
      country: 'US',
      isCommercial: true,
      displayText: '147 Birch Boulevard'
    },
    {
      id: '8',
      address: '258 Willow Way',
      city: 'San Diego',
      state: 'CA',
      zip: '92101',
      country: 'US',
      isCommercial: false,
      displayText: '258 Willow Way'
    },
    {
      id: '9',
      address: '369 Spruce Street',
      city: 'Dallas',
      state: 'TX',
      zip: '75201',
      country: 'US',
      isCommercial: true,
      displayText: '369 Spruce Street'
    },
    {
      id: '10',
      address: '741 Aspen Avenue',
      city: 'San Jose',
      state: 'CA',
      zip: '95101',
      country: 'US',
      isCommercial: false,
      displayText: '741 Aspen Avenue'
    },
    // Additional business addresses
    {
      id: '11',
      address: '1000 Corporate Plaza',
      city: 'Atlanta',
      state: 'GA',
      zip: '30301',
      country: 'US',
      isCommercial: true,
      displayText: '1000 Corporate Plaza'
    },
    {
      id: '12',
      address: '2500 Business Center Drive',
      city: 'Miami',
      state: 'FL',
      zip: '33101',
      country: 'US',
      isCommercial: true,
      displayText: '2500 Business Center Drive'
    },
    {
      id: '13',
      address: '3750 Industrial Boulevard',
      city: 'Detroit',
      state: 'MI',
      zip: '48201',
      country: 'US',
      isCommercial: true,
      displayText: '3750 Industrial Boulevard'
    },
    {
      id: '14',
      address: '4900 Technology Way',
      city: 'Seattle',
      state: 'WA',
      zip: '98101',
      country: 'US',
      isCommercial: true,
      displayText: '4900 Technology Way'
    },
    {
      id: '15',
      address: '5200 Warehouse District',
      city: 'Denver',
      state: 'CO',
      zip: '80201',
      country: 'US',
      isCommercial: true,
      displayText: '5200 Warehouse District'
    }
  ];

  // Filter addresses based on query
  const filteredAddresses = mockAddresses.filter(addr => {
    const searchText = `${addr.address} ${addr.city} ${addr.state}`.toLowerCase();
    return searchText.includes(queryLower) ||
           addr.address.toLowerCase().includes(queryLower) ||
           addr.city.toLowerCase().includes(queryLower) ||
           addr.state.toLowerCase().includes(queryLower) ||
           addr.zip.includes(query);
  });

  console.log('AddressSearch: Filtered to', filteredAddresses.length, 'addresses');

  // Add some dynamic suggestions based on query
  const dynamicSuggestions = [];
  
  // If query looks like a number, suggest addresses with that number
  const numberMatch = query.match(/^\d+/);
  if (numberMatch) {
    const number = numberMatch[0];
    dynamicSuggestions.push(
      {
        id: `dynamic-${number}-1`,
        address: `${number} Main Street`,
        city: 'Anytown',
        state: 'OH',
        zip: '43215',
        country: 'US',
        isCommercial: Math.random() > 0.5,
        displayText: `${number} Main Street`
      },
      {
        id: `dynamic-${number}-2`,
        address: `${number} Business Park Drive`,
        city: 'Commerce City',
        state: 'CA',
        zip: '90210',
        country: 'US',
        isCommercial: true,
        displayText: `${number} Business Park Drive`
      }
    );
  }

  // If query looks like a street name, suggest various numbers
  const streetMatch = query.match(/^(\w+)\s+(street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd|lane|ln|way|court|ct|place|pl)/i);
  if (streetMatch) {
    const streetName = streetMatch[0];
    for (let i = 1; i <= 3; i++) {
      const number = Math.floor(Math.random() * 9000) + 1000;
      dynamicSuggestions.push({
        id: `dynamic-street-${i}`,
        address: `${number} ${streetName}`,
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
        country: 'US',
        isCommercial: Math.random() > 0.5,
        displayText: `${number} ${streetName}`
      });
    }
  }

  // Combine and limit results
  const allSuggestions = [...filteredAddresses, ...dynamicSuggestions]
    .slice(0, 8) // Limit to 8 suggestions
    .map(suggestion => ({
      ...suggestion,
      // Add preference for commercial addresses for origin, residential for destination
      score: type === 'origin' && suggestion.isCommercial ? 1 : 
             type === 'destination' && !suggestion.isCommercial ? 1 : 0.5
    }))
    .sort((a, b) => b.score - a.score);

  console.log('AddressSearch: Returning', allSuggestions.length, 'final suggestions');
  
  return allSuggestions.map(({ score, ...suggestion }) => suggestion);
}