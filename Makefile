.PHONY: init
init:
	# nodejs はインストール済みとする
	rm -rf node_modules
	npm install

.PHONY: run
run:
	npm run start

.PHONY: build
build:
	rm -rf ./dist
	npm run build:prod

.PHONY: build-dev
build-dev:
	rm -rf ./dist
	npm run build:dev

.PHONY: lint
lint:
	npm run eslint
