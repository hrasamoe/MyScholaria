build:
	sed -i '1s/^#\s*//; 2s/^/# /' .env
	@trap "sed -i '1s/^/# /; 2s/^#\s*//' .env" EXIT; \
	npm run build

deploy: build
	firebase deploy

pc:
	cd ../; make pc