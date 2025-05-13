
import { supabase } from './supabaseClient';

// Function to ensure all required buckets exist
export async function ensureStorageBuckets() {
  // List of buckets needed for the app
  const requiredBuckets = [
    'sermons',
    'photos',
    'avatars',
    'documents',
    'gallery-images'
  ];

  try {
    console.log("Starting to create storage buckets...");
    
    // First check if the user has permission to create buckets
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("No active session, cannot create buckets");
      return false;
    }
    
    // Get existing buckets
    const { data: existingBuckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error listing buckets:", error);
      // Try creating anyway in case the error is due to buckets not existing yet
    }

    // Create any missing buckets
    for (const bucketName of requiredBuckets) {
      const bucketExists = existingBuckets?.find(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Creating storage bucket: ${bucketName}`);
        // Make sure buckets are created with public access
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) {
          console.error(`Error creating ${bucketName} bucket:`, createError);
        } else {
          console.log(`Successfully created ${bucketName} bucket`);
          
          // Double check to make sure the bucket is public
          try {
            const { data } = supabase.storage.from(bucketName).getPublicUrl('test');
            console.log(`Bucket ${bucketName} public URL test:`, data);
          } catch (e) {
            console.error(`Failed to get public URL for ${bucketName}:`, e);
          }
        }
      } else {
        console.log(`Bucket ${bucketName} already exists`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring storage buckets:', error);
    return false;
  }
}
