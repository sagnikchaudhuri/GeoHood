import { CategoryGroup, VendorCategory } from '../types';

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'food',
    label: 'Food & Drinks',
    icon: '🍽️',
    color: '#00C896',
    bgColor: 'rgba(0,200,150,0.12)',
    subcategories: [
      'Tea Stall', 'Fast Food', 'Rolls', 'Momos', 'Sweets & Mithai',
      'Bakery', 'Restaurant', 'Cloud Kitchen', 'Juice Bar',
      'Snacks', 'Biryani', 'Chinese', 'South Indian', 'Tiffin Service',
    ],
  },
  {
    id: 'grocery',
    label: 'Grocery & Daily Needs',
    icon: '🛒',
    color: '#4D9EFF',
    bgColor: 'rgba(77,158,255,0.12)',
    subcategories: [
      'General Store / Kirana', 'Supermarket', 'Ration Shop',
      'Dairy / Milk', 'Eggs & Bread', 'Packaged Goods',
    ],
  },
  {
    id: 'fish_meat_veg',
    label: 'Fish / Meat / Veg',
    icon: '🐟',
    color: '#FF7043',
    bgColor: 'rgba(255,112,67,0.12)',
    subcategories: [
      'Fish Seller', 'Chicken Shop', 'Mutton Shop',
      'Vegetable Seller', 'Fruit Seller', 'Egg Seller',
    ],
  },
  {
    id: 'medical',
    label: 'Medical',
    icon: '🏥',
    color: '#FF4D6A',
    bgColor: 'rgba(255,77,106,0.12)',
    subcategories: [
      'General Physician', 'Diagnostic Lab', 'Nursing Home / Clinic',
      'Dental Clinic', 'Eye Care', 'Pediatrician',
      'Homeopathy', 'Ayurveda', 'Physiotherapy',
    ],
  },
  {
    id: 'pharmacy',
    label: 'Pharmacy',
    icon: '💊',
    color: '#E040FB',
    bgColor: 'rgba(224,64,251,0.10)',
    subcategories: [
      'Pharmacy / Medical Store', 'Generic Medicine Store',
      'Surgical Equipment', 'Wellness Products',
    ],
  },
  {
    id: 'repair',
    label: 'Repairs & Technicians',
    icon: '🔧',
    color: '#F5A623',
    bgColor: 'rgba(245,166,35,0.12)',
    subcategories: [
      'Electrician', 'Plumber', 'AC Repair', 'Water Purifier Repair',
      'Mobile / Phone Repair', 'Laptop / Computer Repair',
      'Appliance Repair', 'Carpenter', 'Painter',
      'CCTV Installation', 'TV / Electronics Repair',
    ],
  },
  {
    id: 'home_services',
    label: 'Home Services',
    icon: '🏠',
    color: '#26C6DA',
    bgColor: 'rgba(38,198,218,0.12)',
    subcategories: [
      'Maid / Housekeeping', 'Cook', 'Driver',
      'Laundry / Dry Clean', 'Ironing', 'Car Wash',
      'Water Delivery', 'Gas Cylinder Delivery',
      'Pest Control', 'Packers & Movers',
    ],
  },
  {
    id: 'beauty',
    label: 'Beauty & Wellness',
    icon: '✂️',
    color: '#A855F7',
    bgColor: 'rgba(168,85,247,0.12)',
    subcategories: [
      "Women's Salon", "Men's Barber / Salon",
      'Spa & Massage', 'Nail Art', 'Bridal Makeup',
      'Gym', 'Yoga / Meditation', 'Zumba / Dance Fitness',
    ],
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: '🚗',
    color: '#1666E8',
    bgColor: 'rgba(22,102,232,0.12)',
    subcategories: [
      'Auto Rickshaw', 'Cab / Taxi', 'Courier Service',
      'Goods Tempo / Van', 'Bike Taxi', 'School Van',
    ],
  },
  {
    id: 'education',
    label: 'Education',
    icon: '📚',
    color: '#43A047',
    bgColor: 'rgba(67,160,71,0.12)',
    subcategories: [
      'Tuition (Math)', 'Tuition (Science)', 'Tuition (English)',
      'Coaching Centre', 'Music Classes', 'Dance Classes',
      'Art & Craft', 'Computer / Coding Classes',
      'Spoken English', 'Competitive Exam Coaching',
    ],
  },
  {
    id: 'emergency',
    label: 'Emergency',
    icon: '🚨',
    color: '#FF1744',
    bgColor: 'rgba(255,23,68,0.12)',
    subcategories: [
      'Police Station', 'Fire Station', 'Ambulance',
      'Hospital (Emergency)', 'Blood Bank',
    ],
  },
  {
    id: 'society_services',
    label: 'Society Services',
    icon: '🏢',
    color: '#78909C',
    bgColor: 'rgba(120,144,156,0.12)',
    subcategories: [
      'Committee Contact', 'Security Guard', 'Maintenance',
      'Water Pump Operator', 'Lift Technician', 'Gate Pass',
    ],
  },
  {
    id: 'local_shops',
    label: 'Local Shops',
    icon: '🏪',
    color: '#8D6E63',
    bgColor: 'rgba(141,110,99,0.12)',
    subcategories: [
      'Stationery & Books', 'Electronics Store', 'Clothing / Garments',
      'Footwear', 'Hardware & Tools', 'Gift & Novelty',
      'Toys', 'Cycle Shop', 'Mobile Accessories',
    ],
  },
  {
    id: 'professional',
    label: 'Professional Services',
    icon: '💼',
    color: '#546E7A',
    bgColor: 'rgba(84,110,122,0.12)',
    subcategories: [
      'CA / Accountant', 'Lawyer / Advocate', 'Architect',
      'Interior Designer', 'Insurance Agent', 'Real Estate Agent',
      'Travel Agent', 'Photography', 'Event Management',
    ],
  },
  {
    id: 'other',
    label: 'Other',
    icon: '📦',
    color: '#888888',
    bgColor: 'rgba(136,136,136,0.12)',
    subcategories: ['ATM', 'Cyber Café / Print Shop', 'Post Office', 'Bank Branch', 'Other'],
  },
];

// Quick-access grid categories for Home screen (top 8 most used)
export const HOME_CATEGORIES: VendorCategory[] = [
  'food', 'grocery', 'fish_meat_veg', 'medical',
  'repair', 'home_services', 'beauty', 'transport',
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORY_GROUPS.map(g => [g.id, g])
) as Record<VendorCategory, CategoryGroup>;

// Flat list of all subcategories with parent ref
export const ALL_SUBCATEGORIES = CATEGORY_GROUPS.flatMap(g =>
  g.subcategories.map(sub => ({ sub, parentId: g.id, parentLabel: g.label }))
);
