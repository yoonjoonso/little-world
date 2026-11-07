# Supabase setup: pending access to base

Yoon selected project name **base**. Verify its exact project reference before any database changes. Both migrations are prepared and unapplied. Applying live migrations requires explicit approval for the verified project under AGENTS.md. No service-role credentials belong in the browser or GitHub source.

## Concrete setup sequence

1. Inspect base: existing schema, Auth settings, allowed redirect URLs and existing users. Compare against the two migrations before applying; do not blindly run create-table statements against existing tables.
2. Confirm target and obtain approval to apply the reviewed migration diff. Apply foundation, then requests/discoveries. Verify row-level authorization with unrelated accounts and both world members.
3. Configure email/password accounts for Yoon and Lila. Confirm actual email addresses and account IDs. Create one world owned by Yoon; enroll the owner first, then Lila. Membership limit is two.
4. Set GitHub repository variables VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY using only the browser-safe publishable key. Rebuild Pages. Configure Auth site URL/redirects to the verified Pages origin/path.
5. Verify real login, logout, reload restoration, saved positions and messages in two independent sessions. The current transport polls once per second and does not prove online presence. Do not claim presence/seat locking are finished.
6. Wire shared request submission and private reference-photo storage, NPC message delivery, world updates and per-user update_reads to the frontend. Keep offline drafts distinct; never silently claim they were shared.
7. Connect an authenticated Muse endpoint/worker only after identifying the actual agent product and delegated permissions. Muse messages and board tasks must converge on build_requests. The browser cannot set applied/processing/needs_input outcomes or impersonate an NPC. Agent actions remain structured data; code/map publication continues through the repository workflow.
8. Use claim_build_request for atomic expiring leases. finish_build_request requires the current unexpired claim, outcome and note; applied requires a published version reference. needs_input/failed leaves the old world usable and emits a discovery/decision notification. Long jobs need an explicit heartbeat extension before production worker use.
9. Complete two-session and unrelated-account authorization tests, reconnect tests, file upload limits, notification per-user isolation and actual worker success/failure delivery before calling the shared system live.

## Pending capabilities

No agent gateway, always-running sweep, photo bucket, shared request UI transport, cross-device notification transport, Realtime presence, account-name mapping or atomic seat reservation is configured by these files. The second migration is prepared infrastructure, not a running integration. Table schema must be reviewed and integration-tested against base before use.

The latest prepared player-state migrations include bathing/running/fishing/playing/resting/showering and stable activity target/slot columns. A read-only CLI fallback was attempted; no access token is configured. This did not inspect or alter the live base project.
