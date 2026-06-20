-- Phase 6 (task 6.7): seed first-aid recommendations for Low-risk results.
-- Generic 'Any' rows cover every age; a few age-specific rows let the results
-- page show different guidance for a puppy vs a senior (Phase 6 Done-When).
-- The results query is: symptom_name IN (...) AND (age_range = $ageRange OR 'Any'),
-- preferring the age-specific row over 'Any' when both exist.

INSERT INTO first_aid_recommendations (symptom_name, age_range, recommendation_text) VALUES
('vomiting','Any','Withhold food for 12 hours but keep fresh water available. Reintroduce food gradually with bland options (boiled chicken and rice). If there is blood in the vomit, contact your vet.'),
('diarrhea','Any','Keep your pet hydrated with small, frequent amounts of water. Feed bland food. If diarrhea contains blood or lasts over 24 hours, contact your vet.'),
('lethargy','Any','Keep your pet comfortable and warm with water accessible. Monitor for worsening or loss of appetite.'),
('loss of appetite','Any','Offer a small amount of a favourite food. If not eating for more than 24 hours, contact your vet.'),
('limping','Any','Rest your pet — no running or jumping. Check the paw for cuts or thorns. Apply a cold pack for 10 minutes if swollen.');

-- Age-specific overrides (puppies and seniors dehydrate / decline faster).
INSERT INTO first_aid_recommendations (symptom_name, age_range, recommendation_text) VALUES
('vomiting','Puppy (<1yr)','Do NOT withhold food from a puppy — they can drop their blood sugar quickly. Offer small amounts of a bland diet and water. If a puppy vomits more than twice or seems flat, contact your vet the same day.'),
('vomiting','Senior (>10yr)','Older pets dehydrate and hide illness more easily. Withhold food for only a few hours, keep water available, and contact your vet sooner rather than later if vomiting repeats or your pet seems weak.'),
('diarrhea','Puppy (<1yr)','Puppies dehydrate fast. Offer water frequently and a small bland meal; do not fast a puppy. If diarrhea continues beyond a few hours, is bloody, or the puppy is lethargic, contact your vet promptly.'),
('loss of appetite','Senior (>10yr)','In a senior pet, not eating can signal dental pain or organ disease. Tempt with a warm, favourite food, and if appetite does not return within 24 hours, book a vet check.');
