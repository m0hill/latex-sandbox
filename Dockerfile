FROM docker.io/cloudflare/sandbox:0.3.6

USER root

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    libfontconfig1 \
    libgraphite2-3 \
    libharfbuzz0b \
    libharfbuzz-icu0 \
    libicu70 \
    libssl3 \
    zlib1g && \
    rm -rf /var/lib/apt/lists/*

ARG TECTONIC_VERSION=0.15.0
RUN set -eux; \
    arch="$(dpkg --print-architecture)"; \
    echo "Building for architecture: $arch"; \
    tt_arch="x86_64-unknown-linux-gnu"; \
    curl -fsSL -o /tmp/tectonic.tar.gz \
        "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic@${TECTONIC_VERSION}/tectonic-${TECTONIC_VERSION}-${tt_arch}.tar.gz"; \
    tar -xzf /tmp/tectonic.tar.gz -C /usr/local/bin; \
    chmod +x /usr/local/bin/tectonic; \
    rm -f /tmp/tectonic.tar.gz; \
    tectonic --version

ENV XDG_CACHE_HOME=/var/cache
RUN mkdir -p /var/cache/Tectonic && \
    chmod -R 777 /var/cache/Tectonic && \
    printf '%s\n' \
    '\\documentclass{article}' \
    '\\usepackage{amsmath}' \
    '\\usepackage{amssymb}' \
    '\\usepackage{geometry}' \
    '\\usepackage{graphicx}' \
    '\\usepackage{hyperref}' \
    '\\begin{document}' \
    'Pre-warming Tectonic cache.' \
    '\\end{document}' \
    > /tmp/warmup.tex && \
    tectonic -o /tmp /tmp/warmup.tex 2>&1 || true && \
    rm -rf /tmp/warmup.* && \
    echo "Cache warmup complete"

RUN du -sh /var/cache/Tectonic 2>/dev/null || echo "Cache directory created"
