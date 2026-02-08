# Frontend ↔ Backend TODO (DownApp)

## Switch from demo to real API
- [ ] Set EXPO_PUBLIC_API_BASE_URL to deployed backend URL
- [ ] Flip USE_DEMO to false in src/repositories/index.ts

## Auth
- [ ] Replace fake userId generation with POST /users
- [ ] Store returned userId in AsyncStorage
- [ ] Send x-user-id header on all requests

## Groups
- [ ] Implement create group: POST /groups
- [ ] Implement join group: POST /groups/join
- [ ] Save groupId, groupName, inviteCode to AsyncStorage

## Events
- [ ] GET /events?groupId&from&to in Calendar
- [ ] POST /events in Create Event
- [ ] POST /events/:id/join in Event Detail
- [ ] POST /events/:id/leave in Event Detail
- [ ] POST /events/:id/checkin in Event Detail

## Pokes
- [ ] POST /pokes from Event Detail (select friend + message)
- [ ] Handle RATE_LIMITED error (show nice toast)

## Notifications
- [ ] Request expo push permissions in NameScreen
- [ ] Send pushToken in POST /users
- [ ] (Optional) Handle incoming notifications to deep-link to EventDetail