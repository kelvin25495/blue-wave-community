
import { supabase } from './supabaseClient';

// Function to ensure all required buckets exist
export async function ensureStorageBuckets() {
  // List of buckets needed for the app
  const requiredBuckets = [
    'sermons',
    'photos',
    'avatars',
    'documents'
  ];

  try {
    // Get existing buckets
    const { data: existingBuckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;

    // Create any missing buckets
    for (const bucketName of requiredBuckets) {
      const bucketExists = existingBuckets?.find(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Creating storage bucket: ${bucketName}`);
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) {
          console.error(`Error creating ${bucketName} bucket:`, createError);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring storage buckets:', error);
    return false;
  }
}
