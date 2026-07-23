APP_NAME := ftl-transfer
DIST_DIR := dist
VERSION ?= dev

# Override when needed, for example:
# make release PLATFORMS="linux/amd64 windows/amd64"
PLATFORMS ?= \
	darwin/amd64 \
	darwin/arm64 \
	linux/amd64 \
	linux/arm64 \
	windows/amd64 \
	windows/arm64

LDFLAGS := -s -w

.PHONY: all release package build clean list

all: release

release: clean
	@mkdir -p "$(DIST_DIR)"
	@echo "Generating Windows application resources"
	@go run github.com/tc-hib/go-winres@v0.3.3 simply \
		--arch amd64,arm64 \
		--out ftl_resources \
		--manifest cli \
		--icon web/icon.png \
		--file-description "FTL Transfer" \
		--product-name "FTL Transfer" \
		--original-filename "ftl-transfer.exe"
	@set -e; \
	for platform in $(PLATFORMS); do \
		os=$${platform%/*}; \
		arch=$${platform#*/}; \
		ext=""; \
		if [ "$$os" = "windows" ]; then ext=".exe"; fi; \
		output="$(DIST_DIR)/$(APP_NAME)-$(VERSION)-$$os-$$arch$$ext"; \
		echo "Building $$os/$$arch -> $$output"; \
		CGO_ENABLED=0 GOOS="$$os" GOARCH="$$arch" go build \
			-buildvcs=false \
			-trimpath \
			-ldflags "$(LDFLAGS)" \
			-o "$$output" .; \
	done
	@rm -f ftl_resources_windows_amd64.syso ftl_resources_windows_arm64.syso
	@echo "Built $$(find "$(DIST_DIR)" -maxdepth 1 -type f | wc -l | tr -d ' ') binaries in $(DIST_DIR)/"

package: release
	@go run -buildvcs=false ./cmd/package -dist "$(DIST_DIR)" -icon web/icon.png -version "$(VERSION)"
	@echo "Packaged release assets in $(DIST_DIR)/release/"

build:
	@mkdir -p "$(DIST_DIR)"
	go build -buildvcs=false -trimpath -ldflags "$(LDFLAGS)" -o "$(DIST_DIR)/$(APP_NAME)" .

list:
	@for platform in $(PLATFORMS); do echo "$$platform"; done

clean:
	@rm -rf "$(DIST_DIR)"
	@rm -f ftl_resources_windows_amd64.syso ftl_resources_windows_arm64.syso
