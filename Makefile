.PHONY: dev start_client start_server st lg sync_main sync_branch_with_main sync_dev po pc dp

dev:
	$(MAKE) -f Makefile.dev dev

build_front:
	cd client; make build

deploy_front:
	cd client; make deploy

build_back:
	cd server; make build

start_back:
	cd server; make start
run_back:
	cd server; make dev;

start_client:
	$(MAKE) -f Makefile.dev start_client

start_server:
	$(MAKE) -f Makefile.dev start_server

st:
	$(MAKE) -f Makefile.internal st

lg:
	$(MAKE) -f Makefile.internal lg

sync_main:
	$(MAKE) -f Makefile.internal sync_main

sync_branch_with_main:
	$(MAKE) -f Makefile.internal sync_branch_with_main

sync_remote:
	$(MAKE) -f Makefile.internal sync_remote