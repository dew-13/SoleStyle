const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ogvault';

const sampleApparel = [
  {
    name: "Nike Sportswear Club Fleece",
    brand: "Nike",
    retailPrice: 8500,
    profit: 1500,
    price: 10000,
    description: "Premium comfort with classic Nike style. Made from soft fleece material for ultimate comfort and warmth.",
    image: "/apparel/product1.PNG",
    images: ["/apparel/product1.PNG"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    featured: true,
    hidden: false,
    createdAt: new Date().toISOString(),
    rating: 4.5,
    reviews: 12,
    features: ["Moisture-wicking", "Breathable", "Comfortable fit"]
  },
  {
    name: "Adidas Originals Trefoil Hoodie",
    brand: "Adidas",
    retailPrice: 7800,
    profit: 1200,
    price: 9000,
    description: "Iconic Adidas trefoil logo on a comfortable hoodie. Perfect for casual wear and street style.",
    image: "/apparel/product2.PNG",
    images: ["/apparel/product2.PNG"],
    sizes: ["XS", "S", "M", "L", "XL"],
    featured: true,
    hidden: false,
    createdAt: new Date().toISOString(),
    rating: 4.3,
    reviews: 8,
    features: ["Classic design", "Soft material", "Versatile style"]
  },
  {
    name: "Puma RS-X Sweatshirt",
    brand: "Puma",
    retailPrice: 7200,
    profit: 1300,
    price: 8500,
    description: "Retro-inspired design with modern comfort. The RS-X series brings back the 80s aesthetic with contemporary fit.",
    image: "/apparel/product3.PNG",
    images: ["/apparel/product3.PNG"],
    sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
    featured: false,
    hidden: false,
    createdAt: new Date().toISOString(),
    rating: 4.1,
    reviews: 15,
    features: ["Retro design", "Comfortable fit", "Durable material"]
  },
  {
    name: "Vans Classic Crew Neck",
    brand: "Vans",
    retailPrice: 6500,
    profit: 1000,
    price: 7500,
    description: "Timeless Vans style with the classic logo. Perfect for everyday wear and skate culture enthusiasts.",
    image: "/apparel/product4.PNG",
    images: ["/apparel/product4.PNG"],
    sizes: ["XS", "S", "M", "L", "XL"],
    featured: true,
    hidden: false,
    createdAt: new Date().toISOString(),
    rating: 4.4,
    reviews: 20,
    features: ["Classic logo", "Comfortable cotton", "Versatile design"]
  }
];

async function addApparel() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const apparelCollection = db.collection('apparel');
    
    // Clear existing apparel items (optional - remove this if you want to keep existing items)
    // await apparelCollection.deleteMany({});
    
    // Add new apparel items
    const result = await apparelCollection.insertMany(sampleApparel);
    
    console.log(`Successfully added ${result.insertedCount} apparel items:`);
    result.insertedIds.forEach((id, index) => {
      console.log(`${index + 1}. ${sampleApparel[index].name} - ${sampleApparel[index].brand}`);
    });
    
  } catch (error) {
    console.error('Error adding apparel:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addApparel(); 