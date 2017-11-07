BUILD_ITEMS	:= rules html data public img js manifest.json
DEBUG_ITEMS	:= test/settings.html test/tests/editSettings.js test/lib/jquery/jquery-2.2.4.min.js

release: npm grunt tosdr moveout release-debug

dev: grunt moveout

npm:
	npm install --tldjs-update-rules

grunt:
	grunt build

tosdr:
	grunt execute:tosdr

release-debug: $(DEBUG_ITEMS)
	mkdir release/test
	mkdir release/test/tests/
	rsync -R $(DEBUG_ITEMS) release

moveout: $(BUILD_ITEMS)
	rm -rf release
	mkdir release
	cp -r $(BUILD_ITEMS) release/
	find ./release -type f -name '*.es6.js' -delete
	rm -rf ./release/js/ui
