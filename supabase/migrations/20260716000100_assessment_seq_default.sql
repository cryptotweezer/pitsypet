-- seq is assigned by the set_assessment_seq trigger, so application inserts
-- never pass it. Give the column a DEFAULT so the generated Insert type marks
-- it optional (NOT NULL without a default makes supabase gen types require it
-- on every insert). The sentinel 0 is never a real number (numbering starts at
-- 1) — the trigger replaces both NULL and 0 with max+1 per pet.

alter table public.assessments
  alter column seq set default 0;

create or replace function public.assign_assessment_seq()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.seq is null or new.seq = 0 then
    select coalesce(max(seq), 0) + 1
      into new.seq
      from public.assessments
     where pet_id = new.pet_id;
  end if;
  return new;
end;
$$;
