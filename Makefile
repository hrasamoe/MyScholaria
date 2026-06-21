st:
	git status
lg: st
	git log --oneline

sync_main:
	git switch main
	git pull origin main

sync_dev:
	git switch dev
	git pull origin dev

po: sync_dev sync_main
	git push origin dev hrasamoe

pc: po
	git push organization dev hrasamoe

dp: pc
	cd client && make deploy
dev:
	cd server && make dev
start_client:
	cd client && npm run dev

start_server:
	cd server && make start_server