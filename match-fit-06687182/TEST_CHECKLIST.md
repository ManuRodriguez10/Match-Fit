# MatchFit Application Test Checklist

## 🎯 Critical Functionality Tests

### 1. Authentication & User Management
- [ ] **User Sign Up (Coach)**
  - [ ] Can create coach account
  - [ ] Redirected to team creation/onboarding
  - [ ] Profile is created in database
  
- [ ] **User Sign Up (Player)**
  - [ ] Can create player account
  - [ ] Redirected to profile completion
  - [ ] Profile is created in database

- [ ] **User Login**
  - [ ] Can login with email/password
  - [ ] Redirected to appropriate dashboard
  - [ ] Session persists after page refresh

- [ ] **User Logout**
  - [ ] Logout button works
  - [ ] Redirected to landing page
  - [ ] Session is cleared

- [ ] **Navigation Glitch Fix**
  - [ ] Switch browser tabs and return
  - [ ] Should NOT show loading screen
  - [ ] Should NOT require refresh
  - [ ] Page should remain in same state

### 2. Team Creation & Management
- [ ] **Create Team**
  - [ ] Coach can create a team
  - [ ] Team name and description save correctly
  - [ ] Join code is generated and displayed
  - [ ] Team appears in database

- [ ] **Copy Team Code**
  - [ ] Copy button works
  - [ ] Confirmation popup appears
  - [ ] Code is copied to clipboard

- [ ] **Delete Team**
  - [ ] Delete button works
  - [ ] Confirmation dialog appears
  - [ ] Team is deleted from database
  - [ ] All related data is cleaned up (cascading delete)

### 3. Roster Functionality
- [ ] **Coach Portal Roster**
  - [ ] Shows all coaches in "Coaching Staff" section
  - [ ] Shows all players in "Players" section
  - [ ] All position tabs are visible (Goalkeepers, Defenders, Midfielders, Forwards)
  - [ ] Empty positions show "No [position] found" message
  - [ ] Can switch between position tabs seamlessly
  - [ ] Player counts display correctly in each tab

- [ ] **Player Portal Roster**
  - [ ] Shows all coaches in "Coaching Staff" section
  - [ ] Shows all players in "Players" section
  - [ ] All position tabs are visible
  - [ ] Can switch between position tabs seamlessly
  - [ ] Player counts display correctly

- [ ] **Roster Member Details**
  - [ ] Can click on a member to see details
  - [ ] Details modal/popup displays correctly
  - [ ] Can close the details view

### 4. Player Onboarding
- [ ] **Join Team**
  - [ ] Player can enter team join code
  - [ ] Invalid code shows error
  - [ ] Valid code adds player to team
  - [ ] Player is redirected to profile completion

- [ ] **Profile Completion Gate**
  - [ ] Player blocked from Events page until profile complete
  - [ ] Player blocked from Lineups page until profile complete
  - [ ] Player blocked from Roster page until profile complete
  - [ ] Player blocked from Profile page until profile complete
  - [ ] Appropriate message displayed: "Complete player profile to unlock access"

- [ ] **Complete Player Profile**
  - [ ] Can fill in all required fields (position, jersey number, etc.)
  - [ ] Validation works (jersey number uniqueness, etc.)
  - [ ] Profile saves successfully
  - [ ] After saving, player can access all pages
  - [ ] Profile data persists after leaving page

### 5. Coach Invitations
- [ ] **Generate Coach Invitation Code**
  - [ ] "Generate one-time code" button works
  - [ ] Code is generated and displayed
  - [ ] Code can be copied with confirmation
  - [ ] Code resets when leaving team settings page

- [ ] **Accept Coach Invitation**
  - [ ] Coach can enter invitation code
  - [ ] Invalid/expired code shows error
  - [ ] Valid code adds coach to team
  - [ ] Coach appears in roster

### 6. Event Management
- [ ] **Create Event**
  - [ ] "Create Event" button opens form
  - [ ] Can fill in event details (name, date, opponent, location, etc.)
  - [ ] Date validation works (cannot be in past)
  - [ ] Event saves successfully
  - [ ] Event appears in events list
  - [ ] "Create Event" button hides when form is open

- [ ] **Edit Event**
  - [ ] Can click edit on existing event
  - [ ] Form pre-fills with event data
  - [ ] Can update event details
  - [ ] Changes save successfully
  - [ ] Updated event appears in list

- [ ] **Delete Event**
  - [ ] Can delete an event
  - [ ] Confirmation dialog appears
  - [ ] Event is removed from list
  - [ ] Related lineups are handled correctly

- [ ] **Event Visibility**
  - [ ] Events appear in Coach Events page
  - [ ] Events appear in Player Calendar/Events page
  - [ ] Events appear in Lineup Builder dropdown

### 7. Lineup Management
- [ ] **Build Lineup**
  - [ ] Can select an event from dropdown
  - [ ] Can add players to lineup positions
  - [ ] Can remove players from positions
  - [ ] Lineup field displays correctly

- [ ] **Save Draft Lineup**
  - [ ] "Save Draft" button works
  - [ ] Draft is saved to database
  - [ ] Draft can be loaded later
  - [ ] Draft does NOT appear to players

- [ ] **Publish Lineup**
  - [ ] "Publish" button works
  - [ ] Published lineup appears in database
  - [ ] Published lineup appears in Player Lineups page
  - [ ] Players can view published lineup

- [ ] **Delete Lineup**
  - [ ] Can delete a lineup
  - [ ] Confirmation dialog appears
  - [ ] Lineup is removed

- [ ] **Player Lineup View**
  - [ ] Players can see published lineups
  - [ ] Lineups are filtered by scheduled games
  - [ ] Can view lineup details

### 8. Profile Management
- [ ] **Coach Profile**
  - [ ] Can edit profile information
  - [ ] Changes save successfully
  - [ ] Changes persist after leaving page
  - [ ] Name displays in welcome message
  - [ ] Name displays in bottom sidebar

- [ ] **Player Profile**
  - [ ] Can edit profile information
  - [ ] Changes save successfully
  - [ ] Changes persist after leaving page
  - [ ] All fields update correctly

### 9. Dashboard Functionality
- [ ] **Coach Dashboard**
  - [ ] Welcome message shows coach name
  - [ ] Displays upcoming events
  - [ ] Displays team statistics
  - [ ] Shows recent lineups
  - [ ] No "Create Events" button in top right

- [ ] **Player Dashboard**
  - [ ] Welcome message shows player name
  - [ ] Displays upcoming games
  - [ ] Displays personal statistics
  - [ ] Shows recent lineup appearances

### 10. Team Settings
- [ ] **View Team Settings**
  - [ ] Can access team settings page
  - [ ] Team information displays correctly

- [ ] **Update Team Info**
  - [ ] Can update team name
  - [ ] Can update team description
  - [ ] Changes save successfully

- [ ] **Team Code**
  - [ ] Team code displays
  - [ ] Copy button works with confirmation

## 🔍 Edge Cases & Error Handling

- [ ] **Invalid Team Join Code**
  - [ ] Shows appropriate error message
  - [ ] Does not crash application

- [ ] **Expired Coach Invitation Code**
  - [ ] Shows appropriate error message
  - [ ] Does not crash application

- [ ] **Duplicate Jersey Numbers**
  - [ ] Validation prevents duplicate numbers
  - [ ] Shows appropriate error message

- [ ] **Past Event Dates**
  - [ ] Validation prevents past dates
  - [ ] Shows appropriate error message

- [ ] **Empty States**
  - [ ] No events: Shows "No events" message
  - [ ] No lineups: Shows "No lineups" message
  - [ ] No players: Shows "No players found" message
  - [ ] No coaches: Shows "No coaches found" message

- [ ] **Loading States**
  - [ ] Loading indicators appear during data fetch
  - [ ] Loading states don't persist indefinitely

- [ ] **Error Messages**
  - [ ] Error messages are user-friendly
  - [ ] Error messages are clear and actionable

## 🌐 Cross-Browser & Device Tests

- [ ] **Browser Compatibility**
  - [ ] Works in Chrome
  - [ ] Works in Safari
  - [ ] Works in Firefox
  - [ ] Works in Edge

- [ ] **Responsive Design**
  - [ ] Works on mobile devices
  - [ ] Works on tablets
  - [ ] Navigation works on all screen sizes
  - [ ] Forms are usable on mobile

## 📊 Data Integrity Tests

- [ ] **Team Membership**
  - [ ] All team members see each other in roster
  - [ ] Members from different teams don't see each other

- [ ] **Event Association**
  - [ ] Events are associated with correct team
  - [ ] Events don't appear for other teams

- [ ] **Lineup Association**
  - [ ] Lineups are associated with correct events
  - [ ] Lineups are associated with correct team

- [ ] **Profile Updates**
  - [ ] Profile updates save to database
  - [ ] Updates reflect immediately in UI
  - [ ] Updates persist after page refresh

## 🎯 Priority Testing Order

1. **Critical Path (Must Work)**
   - Team creation
   - Player joining team
   - Profile completion
   - Roster visibility

2. **Core Features (High Priority)**
   - Event creation
   - Lineup builder
   - Profile editing

3. **Secondary Features (Medium Priority)**
   - Coach invitations
   - Team settings
   - Dashboard statistics

4. **Polish (Low Priority)**
   - Empty states
   - Error messages
   - Loading states

## 📝 Test Data Setup

Before testing, ensure you have:
- [ ] At least 1 coach account
- [ ] At least 5-10 player accounts (for lineup testing)
- [ ] Players with different positions (goalkeeper, defender, midfielder, forward)
- [ ] At least 1 team created
- [ ] Test events created

### Using the Seed Script

To quickly create test players for lineup testing:

1. Go to Supabase Dashboard → SQL Editor
2. Find your team_id by running: `SELECT id, name FROM teams;`
3. Open `seed_test_data.sql` and replace `YOUR_TEAM_ID_HERE` with your actual team_id
4. Run the SQL script
5. Verify test players were created using the verification queries in the script

**Note:** Test players created via SQL won't have auth accounts (you can't login as them), but they will appear in rosters and lineups for testing purposes.

