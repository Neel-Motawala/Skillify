FROM ubuntu:22.04

# Prevent locale/timezone prompts
ENV DEBIAN_FRONTEND=noninteractive

# ---------- Install all dependencies ----------
RUN apt-get update && apt-get install -y \
    tzdata \
    time \
    openjdk-17-jdk \
    python3 python3-pip \
    php-cli \
    gcc g++ \
    nodejs npm \
    curl wget git nano \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# ---------- Create sandbox folder ----------
RUN mkdir -p /sandbox
WORKDIR /sandbox

# ---------- Create non-root user ----------
RUN useradd -m runner
USER runner

# Default shell
CMD ["bash"]
