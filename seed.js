const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Artwork = require('./models/Artwork');

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    console.log('Clearing existing seed data...');
    await User.deleteMany({ email: { $regex: '@seed.com$' } });
    await Artwork.deleteMany({}); // Warning: This clears ALL artworks for a fresh start

    console.log('Creating Admin & Seed Artists...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    
    const artistsData = [
      { name: 'System Admin', email: 'admin@arthub.com', password: adminPassword, role: 'admin', subscriptionTier: 'premium' },
      { name: 'Elena Rostova', email: 'elena@seed.com', password: hashedPassword, role: 'artist', subscriptionTier: 'premium' },
      { name: 'Marcus Chen', email: 'marcus@seed.com', password: hashedPassword, role: 'artist', subscriptionTier: 'pro' },
      { name: 'Sophia Reynolds', email: 'sophia@seed.com', password: hashedPassword, role: 'artist', subscriptionTier: 'premium' },
      { name: 'Javier Castillo', email: 'javier@seed.com', password: hashedPassword, role: 'artist', subscriptionTier: 'free' }
    ];

    const createdArtists = await User.insertMany(artistsData);

    console.log('Creating Artworks...');
    const artworks = [
      {
        title: 'Ethereal Dawn',
        description: 'A mesmerizing digital recreation of a sunrise over a mythical mountain range. The colors blend seamlessly to create a calming effect.',
        price: 150.00,
        category: 'Digital',
        image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2070&auto=format&fit=crop',
        artistId: createdArtists[0]._id,
        artistName: createdArtists[0].name,
      },
      {
        title: 'Abstract Harmony',
        description: 'Vibrant strokes of acrylic paint converging into a chaotic yet beautiful harmony. Perfect for modern living spaces.',
        price: 340.00,
        category: 'Painting',
        image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2070&auto=format&fit=crop',
        artistId: createdArtists[1]._id,
        artistName: createdArtists[1].name,
      },
      {
        title: 'Urban Silhouette',
        description: 'A striking black and white photograph capturing the essence of city life during the golden hour.',
        price: 85.00,
        category: 'Photography',
        image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop',
        artistId: createdArtists[2]._id,
        artistName: createdArtists[2].name,
      },
      {
        title: 'The Thinker Reimagined',
        description: 'A 3D digital sculpture concept playing with geometric shapes and lighting to portray deep thought.',
        price: 210.00,
        category: 'Sculpture',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop',
        artistId: createdArtists[3]._id,
        artistName: createdArtists[3].name,
      },
      {
        title: 'Neon Nights',
        description: 'Cyberpunk inspired digital art featuring glowing neon lights reflecting off rain-slicked streets.',
        price: 120.00,
        category: 'Digital',
        image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
        artistId: createdArtists[0]._id,
        artistName: createdArtists[0].name,
      },
      {
        title: 'Ocean Breeze',
        description: 'Oil on canvas. The texture brings the crashing waves to life, making you almost smell the salt in the air.',
        price: 450.00,
        category: 'Painting',
        image: 'https://images.unsplash.com/photo-1580136608260-4eb11f4b24fe?q=80&w=2052&auto=format&fit=crop',
        artistId: createdArtists[1]._id,
        artistName: createdArtists[1].name,
      },
      {
        title: 'Hidden Waterfall',
        description: 'Long exposure photography of a secret waterfall hidden deep within a lush tropical forest.',
        price: 95.00,
        category: 'Photography',
        image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=1887&auto=format&fit=crop',
        artistId: createdArtists[2]._id,
        artistName: createdArtists[2].name,
      },
      {
        title: 'Bronze Elegance',
        description: 'A photograph of an exquisite bronze sculpture capturing the fluidity of human movement.',
        price: 180.00,
        category: 'Sculpture',
        image: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=2000&auto=format&fit=crop',
        artistId: createdArtists[3]._id,
        artistName: createdArtists[3].name,
      }
    ];

    await Artwork.insertMany(artworks);
    console.log(`Seeding Complete! Inserted ${artworks.length} artworks across ${createdArtists.length} artists.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
