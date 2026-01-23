---
status: 'complete'
startedAt: '2026-01-23'
completedAt: '2026-01-23'
epic: 'Epic 2: Patrimoine & Account Management'
storyNumber: '2.2-2.5'
---

# Stories 2.2-2.5: Patrimoine Management (Combined)

## Stories Implemented

### Story 2.2: View Accounts & Total Patrimoine ✅
- Accounts list displayed on /patrimoine page
- Total patrimoine calculated and displayed
- Empty state with prompt to add first account

### Story 2.3: Edit Account Details & Update Balance ✅
- Edit button on each account row
- Edit modal with pre-filled form
- Balance updates reflected immediately in total

### Story 2.4: Delete Account ✅
- Delete button on each account
- Confirmation modal with account name
- Toast notification on success

### Story 2.5: Patrimoine Dashboard Card ✅
- Card on main dashboard showing total patrimoine
- Links to /patrimoine page
- Shows account count

## Files Created/Modified

- `src/routes/patrimoine/+page.svelte` - Full patrimoine management page
- `src/lib/components/dashboard/PatrimoineCard.svelte` - Dashboard summary card
- `src/routes/+page.svelte` - Updated dashboard with PatrimoineCard
- `src/lib/data/accounts.ts` - Added updateAccount function

## Acceptance Criteria Met

- ✅ User can view all accounts with names and balances
- ✅ User can see total patrimoine (sum of all balances)
- ✅ User can edit account name and balance
- ✅ User can delete account with confirmation
- ✅ User can see patrimoine on main dashboard
- ✅ All changes update totals in real-time
- ✅ Toast notifications for all actions
