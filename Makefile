st:
	git status
lg: st
	git log --oneline
mmdh: st
	git switch main
	git merge dev
	git switch dev

po: mmdh
	git push origin main dev hrasamoe

pc: po
	git push organization main dev hrasamoe

dp: pc
	cd client && make deploy
dev:
	cd server && make dev
start_client:
	cd client && npm run dev

start_server:
	cd server && make start_server