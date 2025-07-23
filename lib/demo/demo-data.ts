import { DemoScenario } from './demo-context';

export const demoScenarios: DemoScenario[] = [
  {
    id: 'manufacturing',
    name: 'Manufacturing Company Demo',
    description: 'Heavy machinery shipping with special handling and PO payment.',
    expectedDuration: 5,
    demoData: {
      companyName: 'Heavy Industries Inc.',
      paymentMethod: 'purchase_order',
      packages: [
        {
          weight: '750',
          length: '48',
          width: '40',
          height: '72',
          description: 'Industrial Generator',
          declaredValue: '25000',
        },
      ],
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Start Shipment',
        description: 'Navigate to the shipping page and enter initial details.',
        component: '/shipping',
        actions: [
          { type: 'navigate', target: '/shipping' },
          { type: 'fill', target: '#sender-name', value: 'John Doe' },
        ],
        validations: [],
      },
      // More steps here
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare Demo',
    description: 'High-value, temperature-controlled medical equipment shipping.',
    expectedDuration: 6,
    demoData: {
      companyName: 'MediCare Logistics',
      paymentMethod: 'credit_card',
      specialHandling: ['temperature_control'],
      packages: [
        {
          weight: '150',
          length: '36',
          width: '24',
          height: '30',
          description: 'MRI Coil',
          declaredValue: '75000',
        },
      ],
    },
    steps: [],
  },
];
