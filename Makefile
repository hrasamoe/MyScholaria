status:
	git status

merge_main_dev_hrasamoe: status
	git switch main
	git merge dev
	git switch hrasamoe
	git merge dev
	git switch dev

push_origin: merge_main_dev_hrasamoe
	git push origin main dev hrasamoe

push_organization: push_origin
	git push organization main dev hrasamoe