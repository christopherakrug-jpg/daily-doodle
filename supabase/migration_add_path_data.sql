-- Run this in the Supabase SQL editor to add squiggle path data to prompts

alter table prompts add column if not exists path_data text;

-- Update existing seeded prompts with SVG path data
-- Paths use a 0–100 coordinate space; the app scales them to canvas size

update prompts set path_data = 'M 15 20 C 15 50 85 50 85 80'
  where date = '2026-05-22';

update prompts set path_data = 'M 10 50 C 25 20 45 80 60 50 C 75 20 90 60 95 45'
  where date = '2026-05-23';

update prompts set path_data = 'M 10 80 L 35 30 L 50 55 L 70 15 L 90 80'
  where date = '2026-05-24';

update prompts set path_data = 'M 35 55 C 35 25 65 25 65 55 C 65 80 45 82 35 68'
  where date = '2026-05-25';

update prompts set path_data = 'M 50 50 C 60 40 70 45 65 55 C 58 68 40 65 38 50 C 36 32 55 25 70 35'
  where date = '2026-05-26';

update prompts set path_data = 'M 25 20 Q 25 60 50 75 Q 75 90 80 65 Q 85 40 65 35'
  where date = '2026-05-27';

update prompts set path_data = 'M 10 70 Q 25 35 40 70 Q 55 35 70 70 Q 85 35 95 70'
  where date = '2026-05-28';
