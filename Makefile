.PHONY: lint
lint:
	# TODO: move to custom TSlint/ESLint rules
	@ test `find src test -not -path "*Controller.ts*" -not -path "*gotClient.ts*" -not -path "*apiHelper.ts*" -type f -exec grep -i 'tslint:disable' {} \; | wc -l` = 0 \
		|| (echo "tslint:disable flags are forbidden outside of a $(PWD)" && exit 1)
	@ test `find src test -type f -exec grep -i "^import .* from ['\"]env['\"]" {} \; | wc -l` = 0 \
		|| (echo "Imports from env are forbidden outside of a $(PWD)" && exit 1)
	@ test `find src test -type f -exec grep -i "^import .* } from ['\"]env['\"]" {} \; | wc -l` = 0 \
		|| (echo "Specific imports from env are forbidden." && exit 1)
	@ test `find src test -type f -exec grep -i " interface " {} \; | wc -l` = 0 \
		|| (echo "Use type literals instead of interfaces." && exit 1)
	@ test `find src test -type f -exec grep -i " as unknown as " {} \; | wc -l` = 0 \
		|| (echo "Unsafe type casts are forbidden." && exit 1)
	@ npx tslint -p tsconfig.json
