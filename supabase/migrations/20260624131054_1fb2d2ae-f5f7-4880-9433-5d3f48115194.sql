-- Allow anyone to upload images to the newsletter-images bucket
CREATE POLICY "Public upload newsletter images"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'newsletter-images');

-- Allow anyone to read images from the newsletter-images bucket (used by the public image proxy)
CREATE POLICY "Public read newsletter images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'newsletter-images');