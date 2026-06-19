CREATE OR REPLACE FUNCTION search_assessments(
  query_text  text,
  match_count int DEFAULT 50
)
RETURNS TABLE (
  assessment_id uuid,
  pet_name varchar,
  risk_classification varchar,
  primary_concern text,
  created_at timestamptz,
  relevance real
)
LANGUAGE sql STABLE SECURITY INVOKER AS $$
  SELECT
    a.assessment_id,
    p.pet_name,
    a.risk_classification,
    a.primary_concern,
    a.created_at,
    ts_rank(
      to_tsvector('english',
        COALESCE(a.clinical_reasoning, '') || ' ' ||
        COALESCE(a.primary_concern, '')   || ' ' ||
        COALESCE(a.extracted_symptoms::text, '')
      ),
      plainto_tsquery('english', query_text)
    ) AS relevance
  FROM assessments a
  JOIN pets p ON p.pet_id = a.pet_id
  WHERE a.user_id = auth.uid()
    AND a.user_saved = TRUE
    AND a.deleted_at IS NULL
    AND (
      to_tsvector('english',
        COALESCE(a.clinical_reasoning, '') || ' ' ||
        COALESCE(a.primary_concern, '')   || ' ' ||
        COALESCE(a.extracted_symptoms::text, '')
      ) @@ plainto_tsquery('english', query_text)
      OR p.pet_name ILIKE '%' || query_text || '%'
      OR a.primary_concern ILIKE '%' || query_text || '%'
    )
  ORDER BY relevance DESC, a.created_at DESC
  LIMIT match_count;
$$;
