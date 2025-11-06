FROM ubuntu:22.04

# Prevent locale/timezone prompts
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y tzdata

# ---------- Install All Compilers / Runtimes ----------
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    python3 python3-pip \
    php-cli \
    gcc g++ \
    nodejs npm \
    curl wget git nano \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ---------- Create sandbox folder ----------
RUN mkdir -p /sandbox
WORKDIR /sandbox

# ---------- Create limited user ----------
RUN useradd -m runner
USER runner

# ---------- Disable network inside container (optional runtime safety) ----------
# Docker run should use:  --network none

# Default shell
CMD ["bash"]
