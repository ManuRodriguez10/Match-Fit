-- MatchFit Test Data Seeding Script
-- This script creates test profiles for testing lineups and roster functionality
-- 
-- IMPORTANT: Replace 'YOUR_TEAM_ID_HERE' with your actual team_id from the teams table
-- You can find your team_id by running: SELECT id, name FROM teams;

-- ============================================
-- STEP 1: Find your team_id
-- ============================================
-- Run this query first to find your team_id:
-- SELECT id, name FROM teams;

-- ============================================
-- STEP 2: Replace YOUR_TEAM_ID_HERE below
-- ============================================
-- Replace all instances of 'YOUR_TEAM_ID_HERE' with your actual team_id (UUID format)
-- Example: 'ea78f21b-325d-421a-b2ab-188e0da4d292'

-- ============================================
-- COACHES (3 total: 1 head coach, 2 assistant coaches)
-- ============================================
INSERT INTO profiles (id, email, team_id, team_role, first_name, last_name, full_name, coach_role, years_experience, phone)
VALUES 
  -- Head Coach
  (gen_random_uuid(), 'coach.head@test.com', 'YOUR_TEAM_ID_HERE', 'coach', 'John', 'Smith', 'John Smith', 'head_coach', '10', '+15551000001'),
  -- Assistant Coach 1
  (gen_random_uuid(), 'coach.assistant1@test.com', 'YOUR_TEAM_ID_HERE', 'coach', 'Michael', 'Johnson', 'Michael Johnson', 'assistant_coach', '5', '+15551000002'),
  -- Assistant Coach 2
  (gen_random_uuid(), 'coach.assistant2@test.com', 'YOUR_TEAM_ID_HERE', 'coach', 'David', 'Williams', 'David Williams', 'assistant_coach', '3', '+15551000003')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DEFENDERS (7 total)
-- ============================================
INSERT INTO profiles (id, email, team_id, team_role, position, jersey_number, first_name, last_name, full_name, height, weight, nationality, phone)
VALUES 
  (gen_random_uuid(), 'defender1@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'defender', '2', 'James', 'Brown', 'James Brown', '6''0', '180', 'United States', '+15552000001'),
  (gen_random_uuid(), 'defender2@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'defender', '3', 'Robert', 'Jones', 'Robert Jones', '6''1', '185', 'United States', '+15552000002'),
  (gen_random_uuid(), 'defender3@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'defender', '4', 'William', 'Garcia', 'William Garcia', '5''11', '175', 'United States', '+15552000003'),
  (gen_random_uuid(), 'defender4@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'defender', '5', 'Richard', 'Miller', 'Richard Miller', '6''2', '190', 'United States', '+15552000004'),
  (gen_random_uuid(), 'defender5@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'defender', '13', 'Joseph', 'Davis', 'Joseph Davis', '5''10', '170', 'United States', '+15552000005'),
  (gen_random_uuid(), 'defender6@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'defender', '15', 'Thomas', 'Rodriguez', 'Thomas Rodriguez', '6''0', '182', 'United States', '+15552000006'),
  (gen_random_uuid(), 'defender7@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'defender', '22', 'Charles', 'Martinez', 'Charles Martinez', '5''11', '178', 'United States', '+15552000007')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MIDFIELDERS (8 total)
-- ============================================
INSERT INTO profiles (id, email, team_id, team_role, position, jersey_number, first_name, last_name, full_name, height, weight, nationality, phone)
VALUES 
  (gen_random_uuid(), 'midfielder1@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'midfielder', '6', 'Christopher', 'Hernandez', 'Christopher Hernandez', '5''9', '165', 'United States', '+15553000001'),
  (gen_random_uuid(), 'midfielder2@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'midfielder', '7', 'Daniel', 'Lopez', 'Daniel Lopez', '5''10', '170', 'United States', '+15553000002'),
  (gen_random_uuid(), 'midfielder3@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'midfielder', '8', 'Matthew', 'Wilson', 'Matthew Wilson', '5''8', '160', 'United States', '+15553000003'),
  (gen_random_uuid(), 'midfielder4@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'midfielder', '10', 'Anthony', 'Anderson', 'Anthony Anderson', '5''11', '175', 'United States', '+15553000004'),
  (gen_random_uuid(), 'midfielder5@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'midfielder', '14', 'Mark', 'Taylor', 'Mark Taylor', '5''9', '168', 'United States', '+15553000005'),
  (gen_random_uuid(), 'midfielder6@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'midfielder', '16', 'Donald', 'Thomas', 'Donald Thomas', '5''10', '172', 'United States', '+15553000006'),
  (gen_random_uuid(), 'midfielder7@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'midfielder', '17', 'Steven', 'Jackson', 'Steven Jackson', '5''8', '162', 'United States', '+15553000007'),
  (gen_random_uuid(), 'midfielder8@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'midfielder', '18', 'Paul', 'White', 'Paul White', '5''9', '165', 'United States', '+15553000008')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FORWARDS (6 total)
-- ============================================
INSERT INTO profiles (id, email, team_id, team_role, position, jersey_number, first_name, last_name, full_name, height, weight, nationality, phone)
VALUES 
  (gen_random_uuid(), 'forward1@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'forward', '9', 'Andrew', 'Harris', 'Andrew Harris', '6''0', '175', 'United States', '+15554000001'),
  (gen_random_uuid(), 'forward2@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'forward', '11', 'Joshua', 'Martin', 'Joshua Martin', '5''11', '170', 'United States', '+15554000002'),
  (gen_random_uuid(), 'forward3@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'forward', '19', 'Kenneth', 'Thompson', 'Kenneth Thompson', '6''1', '180', 'United States', '+15554000003'),
  (gen_random_uuid(), 'forward4@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'forward', '20', 'Kevin', 'Moore', 'Kevin Moore', '5''10', '168', 'United States', '+15554000004'),
  (gen_random_uuid(), 'forward5@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'forward', '21', 'Brian', 'Young', 'Brian Young', '6''0', '172', 'United States', '+15554000005'),
  (gen_random_uuid(), 'forward6@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'forward', '23', 'George', 'King', 'George King', '5''11', '175', 'United States', '+15554000006')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check total counts by role
-- SELECT team_role, COUNT(*) as count
-- FROM profiles
-- WHERE team_id = 'YOUR_TEAM_ID_HERE'
-- GROUP BY team_role;

-- Check coaches by role
-- SELECT coach_role, COUNT(*) as count
-- FROM profiles
-- WHERE team_id = 'YOUR_TEAM_ID_HERE' AND team_role = 'coach'
-- GROUP BY coach_role;

-- Check players by position
-- SELECT position, COUNT(*) as count
-- FROM profiles
-- WHERE team_id = 'YOUR_TEAM_ID_HERE' AND team_role = 'player'
-- GROUP BY position
-- ORDER BY position;

-- View all team members
-- SELECT team_role, position, first_name, last_name, jersey_number, coach_role
-- FROM profiles
-- WHERE team_id = 'YOUR_TEAM_ID_HERE'
-- ORDER BY team_role, position, jersey_number;

-- ============================================
-- CLEANUP (if needed)
-- ============================================

-- To remove all test data:
-- DELETE FROM profiles 
-- WHERE team_id = 'YOUR_TEAM_ID_HERE' 
-- AND (email LIKE '%@test.com' OR email LIKE 'coach.%@test.com');

-- ============================================
-- NOTES
-- ============================================
-- 1. Test profiles created via this script will NOT have auth accounts
--    - They will appear in rosters and lineups
--    - You cannot login as these test profiles
--    - For full testing with login, create auth accounts separately
--
-- 2. All test profiles use email addresses matching pattern: *@test.com
--    - This makes them easy to identify and clean up
--
-- 3. The script uses gen_random_uuid() for unique IDs
--    - Each run will create new profiles with different IDs
--    - ON CONFLICT DO NOTHING prevents errors if IDs somehow conflict
--
-- 4. Test data includes:
--    - 3 Coaches (1 head coach, 2 assistant coaches)
--    - 7 Defenders (jersey #2, #3, #4, #5, #13, #15, #22)
--    - 8 Midfielders (jersey #6, #7, #8, #10, #14, #16, #17, #18)
--    - 6 Forwards (jersey #9, #11, #19, #20, #21, #23)
--    Total: 24 team members
