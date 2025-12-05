-- MatchFit Test Data Seeding Script
-- This script creates test player profiles for testing lineups and roster functionality
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
-- Test Players - Goalkeepers
-- ============================================
INSERT INTO profiles (id, email, team_id, team_role, position, jersey_number, first_name, last_name, full_name, height, weight, nationality, phone)
VALUES 
  (gen_random_uuid(), 'test.goalkeeper1@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'goalkeeper', '1', 'Test', 'Goalkeeper', 'Test Goalkeeper', '6''2', '185', 'United States', '+15551234567'),
  (gen_random_uuid(), 'test.goalkeeper2@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'goalkeeper', '12', 'Backup', 'Keeper', 'Backup Keeper', '6''0', '175', 'United States', '+15551234568')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Test Players - Defenders
-- ============================================
INSERT INTO profiles (id, email, team_id, team_role, position, jersey_number, first_name, last_name, full_name, height, weight, nationality, phone)
VALUES 
  (gen_random_uuid(), 'test.defender1@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'defender', '2', 'Test', 'Defender', 'Test Defender', '5''10', '170', 'United States', '+15551234569'),
  (gen_random_uuid(), 'test.defender2@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'defender', '3', 'Center', 'Back', 'Center Back', '6''1', '180', 'United States', '+15551234570'),
  (gen_random_uuid(), 'test.defender3@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'defender', '4', 'Left', 'Back', 'Left Back', '5''9', '165', 'United States', '+15551234571'),
  (gen_random_uuid(), 'test.defender4@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'defender', '5', 'Right', 'Back', 'Right Back', '5''11', '172', 'United States', '+15551234572')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Test Players - Midfielders
-- ============================================
INSERT INTO profiles (id, email, team_id, team_role, position, jersey_number, first_name, last_name, full_name, height, weight, nationality, phone)
VALUES 
  (gen_random_uuid(), 'test.midfielder1@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'midfielder', '6', 'Test', 'Midfielder', 'Test Midfielder', '5''8', '160', 'United States', '+15551234573'),
  (gen_random_uuid(), 'test.midfielder2@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'midfielder', '7', 'Central', 'Mid', 'Central Mid', '5''9', '165', 'United States', '+15551234574'),
  (gen_random_uuid(), 'test.midfielder3@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'midfielder', '8', 'Attacking', 'Mid', 'Attacking Mid', '5''7', '155', 'United States', '+15551234575'),
  (gen_random_uuid(), 'test.midfielder4@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'midfielder', '10', 'Wide', 'Mid', 'Wide Mid', '5''10', '168', 'United States', '+15551234576')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Test Players - Forwards
-- ============================================
INSERT INTO profiles (id, email, team_id, team_role, position, jersey_number, first_name, last_name, full_name, height, weight, nationality, phone)
VALUES 
  (gen_random_uuid(), 'test.forward1@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'forward', '9', 'Test', 'Forward', 'Test Forward', '6''0', '175', 'United States', '+15551234577'),
  (gen_random_uuid(), 'test.forward2@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'forward', '11', 'Striker', 'One', 'Striker One', '5''11', '170', 'United States', '+15551234578'),
  (gen_random_uuid(), 'test.forward3@test.com', 'YOUR_TEAM_ID_HERE', 'player', 'forward', '14', 'Winger', 'Left', 'Winger Left', '5''9', '165', 'United States', '+15551234579')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check how many test players were created by position
-- SELECT team_role, position, COUNT(*) as count 
-- FROM profiles 
-- WHERE team_id = 'YOUR_TEAM_ID_HERE' AND team_role = 'player'
-- GROUP BY team_role, position
-- ORDER BY position;

-- View all test players with their details
-- SELECT id, email, first_name, last_name, position, jersey_number, team_role
-- FROM profiles 
-- WHERE team_id = 'YOUR_TEAM_ID_HERE'
-- ORDER BY team_role, position, jersey_number;

-- View all team members (coaches and players)
-- SELECT team_role, COUNT(*) as count
-- FROM profiles
-- WHERE team_id = 'YOUR_TEAM_ID_HERE'
-- GROUP BY team_role;

-- ============================================
-- CLEANUP (if needed)
-- ============================================

-- To remove all test players (run this if you want to start fresh):
-- DELETE FROM profiles 
-- WHERE team_id = 'YOUR_TEAM_ID_HERE' 
-- AND email LIKE 'test.%@test.com';

-- ============================================
-- NOTES
-- ============================================
-- 1. Test players created via this script will NOT have auth accounts
--    - They will appear in rosters and lineups
--    - You cannot login as these test players
--    - For full testing with login, create auth accounts separately
--
-- 2. All test players use email addresses matching pattern: test.*@test.com
--    - This makes them easy to identify and clean up
--
-- 3. The script uses gen_random_uuid() for unique IDs
--    - Each run will create new players with different IDs
--    - ON CONFLICT DO NOTHING prevents errors if IDs somehow conflict
--
-- 4. Test data includes:
--    - 2 Goalkeepers (jersey #1, #12)
--    - 4 Defenders (jersey #2, #3, #4, #5)
--    - 4 Midfielders (jersey #6, #7, #8, #10)
--    - 3 Forwards (jersey #9, #11, #14)
--    Total: 13 test players across all positions

