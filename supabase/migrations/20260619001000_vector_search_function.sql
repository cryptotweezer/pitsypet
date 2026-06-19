CREATE OR REPLACE FUNCTION search_veterinary_knowledge(
  query_embedding vector(1536),
  match_species   text,
  match_count     int DEFAULT 12
)
RETURNS TABLE (
  chunk_id uuid,
  text text,
  source text,
  species text,
  urgency_level int,
  body_system text,
  breed_specific boolean,
  similarity float
)
LANGUAGE sql STABLE AS $$
  SELECT
    vk.chunk_id,
    vk.text,
    vk.source::text,
    vk.species::text,
    vk.urgency_level,
    vk.body_system::text,
    vk.breed_specific,
    1 - (vk.embedding <=> query_embedding) AS similarity
  FROM veterinary_knowledge vk
  WHERE (vk.species = match_species OR vk.species = 'Both')
    AND vk.embedding IS NOT NULL
  ORDER BY vk.embedding <=> query_embedding
  LIMIT match_count;
$$;
