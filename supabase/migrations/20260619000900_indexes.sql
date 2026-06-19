CREATE INDEX idx_pets_user_id      ON pets(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assessments_user  ON assessments(user_id);
CREATE INDEX idx_assessments_pet   ON assessments(pet_id);
CREATE INDEX idx_assessments_saved ON assessments(user_id, user_saved) WHERE user_saved = TRUE;

CREATE INDEX idx_assessments_fts ON assessments USING GIN (
  to_tsvector('english',
    COALESCE(clinical_reasoning, '') || ' ' ||
    COALESCE(primary_concern, '')   || ' ' ||
    COALESCE(extracted_symptoms::text, '')
  )
);

CREATE INDEX idx_breeds_name    ON breeds USING GIN (name gin_trgm_ops);
CREATE INDEX idx_pets_name_trgm ON pets USING GIN (pet_name gin_trgm_ops);

CREATE INDEX idx_vet_knowledge_embedding ON veterinary_knowledge
  USING hnsw (embedding vector_cosine_ops);
