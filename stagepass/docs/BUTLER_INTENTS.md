# Encore — Butler Intent Map (Global Mascot)

## Goals
- Route users instantly to what they want.
- Turn creator actions into executable steps.
- Explain visibility rules (no hidden algorithm).
- Enforce safety with transparent, appealable actions.

## Response Format
- speechText (what Encore says)
- uiText (short on-screen summary)
- emotion tag
- action list (typed actions that frontend executes)
- audit logging for privileged actions

## Emotion Tags
FOCUSED, EXCITED, CALM, ANALYTICAL, CONCERNED

## Canonical Intents (MVP)
### NAVIGATION
1) go_home
2) go_explore
3) go_live_now
4) go_radio
5) go_creator_channel (by name/slug)
6) go_content (by title/id)

### DISCOVERY
7) search_creators
8) search_content
9) filter_by_genre
10) filter_by_format (LIVE/VIDEO/AUDIO/MIX)

### CREATOR ACTIONS (requires auth)
11) start_upload_flow
12) publish_content
13) edit_content_metadata
14) create_live_session
15) end_live_session
16) schedule_radio_show
17) view_studio

### POLICY & TRUST
18) explain_visibility
19) explain_policies
20) report_content
21) appeal_action

## Intent Routing Rules
- If user says “live DJ” → prioritize LIVE + DJ_RADIO creators
- If “radio” → global station first, then scheduled shows
- If “premiere” or “release” → route to upload/publish flow

## Example Mappings
User: “Show me DJs live right now”
- intent: filter_by_format + filter_by_creatorType DJ_RADIO
- action: NAVIGATE /live?type=DJ_RADIO

User: “I want to go live”
- intent: create_live_session
- action: CREATE_LIVE (call API /live/session)

User: “Why is my post not showing?”
- intent: explain_visibility
- action: EXPLAIN_VISIBILITY + link to policy UI

## Safety
- If user requests illegal or abusive content → refuse + redirect + offer allowed alternatives.
- If user requests “no restrictions” content that violates laws → explain policy and refuse.