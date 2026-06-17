build:
	sed -i '1s/^#\s*//; 2s/^/# /; 3s/^#\s*//; 4s/^/# /' .env
	@trap "sed -i '1s/^/# /; 2s/^#\s*//; 3s/^/# /; 4s/^#\s*//' .env" EXIT; \
	npm run build

deploy: build
	firebase deploy

pc:
	cd ../; make pc

start_client:
	npm run dev