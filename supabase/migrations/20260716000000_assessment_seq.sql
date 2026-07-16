-- Per-pet sequential assessment number → human-friendly results URLs
-- (/pets/<slug>/results/<seq> instead of /assessment/<uuid>/results).
--
-- Backfill numbers EVERY existing row per pet in created_at order, including
-- soft-deleted ones, so numbers are stable and never reused when a row is
-- deleted (a live assessment keeps its number forever; old UUID links redirect).
-- New rows get seq from a BEFORE INSERT trigger (max+1 per pet). All of a
-- pet's rows belong to one owner, so the invoker-rights MAX() under RLS sees
-- the full set. The unique index guards against any race assigning twice.

alter table public.assessments
  add column if not exists seq integer;

with numbered as (
  select assessment_id,
         row_number() over (
           partition by pet_id
           order by created_at, assessment_id
         ) as rn
  from public.assessments
)
update public.assessments a
set seq = n.rn
from numbered n
where a.assessment_id = n.assessment_id
  and a.seq is null;

alter table public.assessments
  alter column seq set not null;

create unique index if not exists assessments_pet_seq_key
  on public.assessments (pet_id, seq);

create or replace function public.assign_assessment_seq()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.seq is null then
    select coalesce(max(seq), 0) + 1
      into new.seq
      from public.assessments
     where pet_id = new.pet_id;
  end if;
  return new;
end;
$$;

drop trigger if exists set_assessment_seq on public.assessments;
create trigger set_assessment_seq
  before insert on public.assessments
  for each row
  execute function public.assign_assessment_seq();
