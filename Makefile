ci: deps
	@npm run lint
	@npm run test:ci
ifneq ($(CI),)
	@npm run codecov
endif

dev: deps
	@npm run dev

test: deps
	@LCOV_OUTPUT=html npm run test:ci

deps:
	@(((ls node_modules | grep .) > /dev/null 2>&1) || npm i --silent) || true
