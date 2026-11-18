-- Web push was removed along with the service worker, so its subscription table is no longer used.
drop table if exists public.push_subscriptions;
