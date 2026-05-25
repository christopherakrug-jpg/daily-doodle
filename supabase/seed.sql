-- Seed 7 days of prompts with squiggle path data.
-- Paths use a 0–100 coordinate space; the app scales them to canvas size.
-- prompt_text is used as a description / accessibility label.

insert into prompts (date, prompt_text, path_data) values
  ('2026-05-22', 'an s-curve? where does it bend next?',       'M 15 20 C 15 50 85 50 85 80'),
  ('2026-05-23', 'a wave? where will it take you?',            'M 10 50 C 25 20 45 80 60 50 C 75 20 90 60 95 45'),
  ('2026-05-24', 'mountain peaks? what lies beyond them?',     'M 10 80 L 35 30 L 50 55 L 70 15 L 90 80'),
  ('2026-05-25', 'an open loop? how will you close it?',       'M 35 55 C 35 25 65 25 65 55 C 65 80 45 82 35 68'),
  ('2026-05-26', 'a spiral? where does it lead?',              'M 50 50 C 60 40 70 45 65 55 C 58 68 40 65 38 50 C 36 32 55 25 70 35'),
  ('2026-05-27', 'a hook? what does it catch?',                'M 25 20 Q 25 60 50 75 Q 75 90 80 65 Q 85 40 65 35'),
  ('2026-05-28', 'scallop edges? what grows from here?',       'M 10 70 Q 25 35 40 70 Q 55 35 70 70 Q 85 35 95 70')
on conflict (date) do update set prompt_text = excluded.prompt_text;
