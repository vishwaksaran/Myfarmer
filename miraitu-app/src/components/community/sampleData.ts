import { Post, Story, NewsEvent, TrendingTopic, SuggestedUser } from './types';

export const sampleStories: Story[] = [
  { id: 'own', author: 'Your Story', avatar: '', image: '', seen: false, isOwn: true },
  { id: 's1', author: 'Rajesh K.', avatar: '👨‍🌾', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=700&fit=crop', seen: false, isOwn: false },
  { id: 's1b', author: 'Rajesh K.', avatar: '👨‍🌾', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=700&fit=crop', seen: false, isOwn: false },
  { id: 's1c', author: 'Rajesh K.', avatar: '👨‍🌾', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=700&fit=crop', seen: false, isOwn: false },
  { id: 's2', author: 'Priya S.', avatar: '👩‍🌾', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=700&fit=crop', seen: false, isOwn: false },
  { id: 's3', author: 'Amit P.', avatar: '🧑‍🌾', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=700&fit=crop', seen: false, isOwn: false },
  { id: 's4', author: 'Sunita D.', avatar: '👩‍🌾', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=700&fit=crop', seen: true, isOwn: false },
  { id: 's5', author: 'Karthik R.', avatar: '👨‍🌾', image: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c8b8b?w=400&h=700&fit=crop', seen: true, isOwn: false },
  { id: 's6', author: 'Meena V.', avatar: '👩‍🌾', image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=700&fit=crop', seen: false, isOwn: false },
  { id: 's7', author: 'Vikram S.', avatar: '👨‍🌾', image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=700&fit=crop', seen: true, isOwn: false },
];

export const samplePosts: Post[] = [
  {
    id: 'p1',
    author: 'Rajesh Kumar',
    username: 'rajesh_organic',
    avatar: '👨‍🌾',
    verified: true,
    location: 'Punjab, India',
    time: '2 hours ago',
    content: 'Just harvested my first organic wheat crop this season! 🌾✨ The yield was 20% higher than last year thanks to the new drip irrigation techniques I learned from this amazing community.\n\nKey changes I made:\n• Switched to organic compost\n• Installed drip irrigation\n• Used neem-based pest control\n\nNever going back to chemical farming! Who else is making the switch? 🌱',
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop',
    ],
    reactions: { like: 156, love: 89, celebrate: 45, insightful: 12, funny: 0, growth: 34 },
    myReaction: null,
    totalReactions: 336,
    comments: [
      {
        id: 'c1', author: 'Priya Sharma', avatar: '👩‍🌾', text: 'Congratulations Rajesh bhai! 🎉 What irrigation brand did you use? I want to try the same setup for my cotton field.', time: '1h ago', likes: 24, liked: false, replies: [
          { id: 'c1r1', author: 'Rajesh Kumar', avatar: '👨‍🌾', text: '@Priya I used Jain Irrigation drip system. Very cost effective and the government subsidy covers 55%!', time: '45m ago', likes: 18, liked: false },
          { id: 'c1r2', author: 'Amit Patel', avatar: '🧑‍🌾', text: 'Jain is great! I\'ve been using it for 2 years now. Worth every rupee.', time: '30m ago', likes: 8, liked: false },
        ]
      },
      { id: 'c2', author: 'Karthik Reddy', avatar: '👨‍🌾', text: 'Amazing yield! 20% increase is incredible. How much water did you save compared to flood irrigation?', time: '55m ago', likes: 15, liked: false, replies: [] },
      { id: 'c3', author: 'Sunita Devi', avatar: '👩‍🌾', text: 'This gives me so much hope! Our cooperative is also planning to go organic next season. 💪', time: '40m ago', likes: 31, liked: false, replies: [] },
    ],
    commentCount: 32,
    shares: 15,
    saved: false,
    tags: ['#OrganicFarming', '#WheatHarvest', '#Punjab', '#DripIrrigation', '#SustainableAgriculture'],
    type: 'image',
  },
  {
    id: 'p2',
    author: 'Priya Sharma',
    username: 'priya_agri',
    avatar: '👩‍🌾',
    verified: false,
    location: 'Maharashtra, India',
    time: '5 hours ago',
    content: '🎥 Watch how I set up my low-cost polyhouse for growing capsicum in just ₹50,000! Many people think polyhouse farming requires lakhs but with the right materials and government subsidy, it\'s very affordable.\n\nDrop a "🌶️" if you want the complete cost breakdown!',
    video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    reactions: { like: 67, love: 123, celebrate: 34, insightful: 89, funny: 2, growth: 56 },
    myReaction: null,
    totalReactions: 371,
    comments: [
      { id: 'c4', author: 'Meena Verma', avatar: '👩‍🌾', text: '🌶️🌶️🌶️ Please share the breakdown! This is exactly what I needed!', time: '4h ago', likes: 45, liked: false, replies: [] },
      {
        id: 'c5', author: 'Vikram Singh', avatar: '👨‍🌾', text: 'Which subsidy scheme did you use? MIDH or state scheme?', time: '3h ago', likes: 22, liked: false, replies: [
          { id: 'c5r1', author: 'Priya Sharma', avatar: '👩‍🌾', text: 'I got subsidy under NHM (National Horticulture Mission). They cover up to 50% for polyhouse.', time: '2h ago', likes: 33, liked: false },
        ]
      },
    ],
    commentCount: 56,
    shares: 89,
    saved: false,
    tags: ['#Polyhouse', '#CapsicumFarming', '#LowCost', '#GovtSubsidy', '#Maharashtra'],
    type: 'video',
  },
  {
    id: 'p3',
    author: 'Amit Patel',
    username: 'amit_smartfarm',
    avatar: '🧑‍🌾',
    verified: true,
    location: 'Gujarat, India',
    time: '8 hours ago',
    content: 'Just installed a solar-powered water pump on my 5-acre farm! ☀️💧\n\nSaved ₹3,000/month on electricity and the PM-KUSUM scheme covered 60% of the cost. If you\'re still using diesel pumps, here\'s why you should switch:\n\n✅ Zero running cost\n✅ Government subsidy up to 60%\n✅ Payback in 2-3 years\n✅ 25-year lifespan\n✅ Can sell excess power to grid\n\nAsk me anything about the application process! 🙌',
    images: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1592982537447-6f2a6a0c8b8b?w=800&h=600&fit=crop',
    ],
    reactions: { like: 234, love: 167, celebrate: 89, insightful: 156, funny: 3, growth: 78 },
    myReaction: null,
    totalReactions: 727,
    comments: [
      {
        id: 'c6', author: 'Rajesh Kumar', avatar: '👨‍🌾', text: 'Amit bhai, what capacity pump did you install? I have 3 acres and need to decide the HP.', time: '6h ago', likes: 12, liked: false, replies: [
          { id: 'c6r1', author: 'Amit Patel', avatar: '🧑‍🌾', text: '5HP for 5 acres is perfect. For 3 acres, 3HP should be enough. The dealer will do a site assessment too.', time: '5h ago', likes: 8, liked: false },
        ]
      },
      { id: 'c7', author: 'Lakshmi N.', avatar: '👩‍🌾', text: 'Can we apply online for PM-KUSUM? Or do we need to visit the agriculture office?', time: '5h ago', likes: 28, liked: false, replies: [] },
    ],
    commentCount: 78,
    shares: 145,
    saved: false,
    tags: ['#SolarPump', '#PMKUSUM', '#SmartFarming', '#SolarEnergy', '#Gujarat'],
    type: 'image',
  },
  {
    id: 'p4',
    author: 'Sunita Devi',
    username: 'sunita_coop',
    avatar: '👩‍🌾',
    verified: true,
    location: 'Uttar Pradesh, India',
    time: '1 day ago',
    content: '🎉 HUGE NEWS! Our women\'s farming cooperative just crossed ₹1 Crore annual revenue! 🎊\n\nStarted with 15 women and ₹50,000 three years ago. Today we are 150+ members strong. We grow organic vegetables, make pickles, and sell at farmer markets.\n\nTo every woman reading this — if we can do it, so can you! Don\'t let anyone tell you farming is not for women. 💪👩‍🌾\n\n#WomenPower #Inspiration',
    images: [
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop',
    ],
    reactions: { like: 456, love: 389, celebrate: 234, insightful: 67, funny: 0, growth: 123 },
    myReaction: null,
    totalReactions: 1269,
    comments: [
      { id: 'c8', author: 'Dr. Anita G.', avatar: '👩‍⚕️', text: 'Incredible journey Sunita ji! Would love to feature your cooperative in our agricultural magazine. Please DM me!', time: '20h ago', likes: 89, liked: false, replies: [] },
      { id: 'c9', author: 'Ravi Shankar', avatar: '👨‍🌾', text: 'Massive inspiration! This is what community farming is all about! 🙏', time: '18h ago', likes: 56, liked: false, replies: [] },
      {
        id: 'c10', author: 'Priya Sharma', avatar: '👩‍🌾', text: 'Sunita didi you are my role model! How do I start a cooperative in my village?', time: '16h ago', likes: 43, liked: false, replies: [
          { id: 'c10r1', author: 'Sunita Devi', avatar: '👩‍🌾', text: 'Thank you beta! First register with the District Cooperative Society. I\'ll make a detailed post with step-by-step guide soon. 🌱', time: '14h ago', likes: 67, liked: false },
        ]
      },
    ],
    commentCount: 94,
    shares: 312,
    saved: false,
    tags: ['#WomenInAgriculture', '#Cooperative', '#SuccessStory', '#OrganicFarming', '#WomenEmpowerment'],
    type: 'image',
  },
  {
    id: 'p5',
    author: 'Karthik Reddy',
    username: 'karthik_agritech',
    avatar: '👨‍🌾',
    verified: false,
    location: 'Andhra Pradesh, India',
    time: '2 days ago',
    content: '📱 Top 5 FREE apps every Indian farmer MUST have in 2026:\n\n1. 🌤️ Miraitu - Weather, mandi prices, crop advice\n2. 🏛️ PM-Kisan - Track subsidy payments\n3. 🌾 Crop Insurance - PMFBY claims\n4. 💰 eNAM - Direct market access\n5. 🔬 AgriStack - Soil health cards\n\nSave this post and share with farmer friends who still rely only on middlemen! The digital revolution in farming is here! 📲',
    reactions: { like: 345, love: 78, celebrate: 23, insightful: 234, funny: 12, growth: 45 },
    myReaction: null,
    totalReactions: 737,
    comments: [
      { id: 'c11', author: 'Arun M.', avatar: '👨‍💻', text: 'Great list! I would also add KisanSuvidha app by government. Very helpful for weather alerts.', time: '1d ago', likes: 34, liked: false, replies: [] },
    ],
    commentCount: 65,
    shares: 423,
    saved: false,
    tags: ['#AgriTech', '#FarmingApps', '#DigitalFarming', '#Miraitu', '#IndianFarmer'],
    type: 'post',
  },
  {
    id: 'p6',
    author: 'Dr. Mangesh Thakur',
    username: 'dr_mangesh_agri',
    avatar: '👨‍🔬',
    verified: true,
    location: 'IARI, New Delhi',
    time: '3 days ago',
    content: '⚠️ ALERT: Fall Armyworm spotted in multiple districts of Karnataka and Tamil Nadu. Here are immediate steps to protect your maize and millet crops:\n\n1. Scout your field early morning when larvae are active\n2. Use pheromone traps (5 per acre)\n3. Apply Emamectin Benzoate 5% SG @ 0.4g/litre\n4. Encourage natural predators like wasps and ladybugs\n5. Report sightings on the Crop Protection portal\n\nDO NOT panic spray. Targeted application saves money and is more effective. Reach out to your local KVK for guidance. 🛡️🌽',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
    ],
    reactions: { like: 189, love: 34, celebrate: 5, insightful: 312, funny: 0, growth: 23 },
    myReaction: null,
    totalReactions: 563,
    comments: [
      { id: 'c12', author: 'Mohan K.', avatar: '👨‍🌾', text: 'Thank you Doctor! We noticed some damage in our field yesterday. Will follow these steps immediately.', time: '2d ago', likes: 18, liked: false, replies: [] },
      {
        id: 'c13', author: 'Lakshmi N.', avatar: '👩‍🌾', text: 'Can neem oil be used as alternative? My field is organic certified.', time: '2d ago', likes: 25, liked: false, replies: [
          { id: 'c13r1', author: 'Dr. Mangesh Thakur', avatar: '👨‍🔬', text: 'Yes! Neem oil (Azadirachtin 1500ppm) @ 5ml/litre is effective for organic fields. Apply in evening hours for best results.', time: '2d ago', likes: 41, liked: false },
        ]
      },
    ],
    commentCount: 45,
    shares: 567,
    saved: false,
    tags: ['#CropProtection', '#FallArmyworm', '#PestAlert', '#Maize', '#OrganicSolution'],
    type: 'image',
  },
];

export const sampleNewsEvents: NewsEvent[] = [
  {
    id: 'n1',
    title: 'India\'s Wheat Export Hits Record High in 2026 Season',
    source: 'Agriculture Today',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=200&fit=crop',
    url: '#',
    date: 'Mar 31, 2026',
    category: 'Trade',
  },
  {
    id: 'n2',
    title: 'PM-KISAN 20th Installment Released: ₹2,000 Credited to 11 Crore Farmers',
    source: 'Govt. of India',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=200&fit=crop',
    url: '#',
    date: 'Mar 30, 2026',
    category: 'Government',
  },
  {
    id: 'n3',
    title: 'Global Food Summit 2026: Climate-Resilient Crops Take Center Stage',
    source: 'FAO',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=200&fit=crop',
    url: '#',
    date: 'Mar 29, 2026',
    category: 'World Event',
  },
  {
    id: 'n4',
    title: 'ICAR Launches New Disease-Resistant Rice Variety for Kharif 2026',
    source: 'ICAR',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=200&fit=crop',
    url: '#',
    date: 'Mar 28, 2026',
    category: 'Research',
  },
  {
    id: 'n5',
    title: 'EU Increases Organic Import Quota — Big Opportunity for Indian Farmers',
    source: 'Reuters Agriculture',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=200&fit=crop',
    url: '#',
    date: 'Mar 27, 2026',
    category: 'Trade',
  },
  {
    id: 'n6',
    title: 'World Water Day: UN Report Highlights Smart Irrigation Adoption in Asia',
    source: 'United Nations',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=200&fit=crop',
    url: '#',
    date: 'Mar 26, 2026',
    category: 'World Event',
  },
];

export const trendingTopics: TrendingTopic[] = [
  { tag: '#OrganicFarming', posts: '12.5K', growth: '+23%' },
  { tag: '#MonsoonPrep2026', posts: '8.3K', growth: '+45%' },
  { tag: '#DroneAgriculture', posts: '6.1K', growth: '+67%' },
  { tag: '#SoilHealth', posts: '5.8K', growth: '+12%' },
  { tag: '#PMKUSUM', posts: '4.9K', growth: '+34%' },
  { tag: '#FarmersMarket', posts: '4.2K', growth: '+18%' },
  { tag: '#WomenInAgriculture', posts: '3.8K', growth: '+56%' },
  { tag: '#AgriStartup', posts: '3.1K', growth: '+89%' },
];

export const suggestedUsers: SuggestedUser[] = [
  { name: 'Dr. Swaminathan', username: 'dr_swami_agri', avatar: '👨‍🔬', bio: 'Agricultural Scientist | IARI | Soil Expert', followers: '45K', following: false },
  { name: 'Kavitha Farms', username: 'kavitha_organic', avatar: '👩‍🌾', bio: 'Organic Farmer | Tamil Nadu | Educator', followers: '28K', following: false },
  { name: 'AgriDrone India', username: 'agridrone_in', avatar: '🚁', bio: 'Drone spraying services | Pan India', followers: '15K', following: false },
  { name: 'Kisaan Union', username: 'kisaan_union', avatar: '✊', bio: 'Farmer Rights | Policy Updates | News', followers: '120K', following: false },
];
