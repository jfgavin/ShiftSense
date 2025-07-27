FROM node:18-bullseye

# Install Java, Android SDK dependencies
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    wget unzip git curl watchman libglu1-mesa \
    && rm -rf /var/lib/apt/lists/*

# Environment vars
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH

# Install Android command-line tools
RUN mkdir -p $ANDROID_SDK_ROOT/cmdline-tools && \
    cd $ANDROID_SDK_ROOT && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O tools.zip && \
    unzip tools.zip -d tmp && \
    mv tmp/cmdline-tools $ANDROID_SDK_ROOT/cmdline-tools/latest && \
    rm -rf tmp tools.zip

# Accept licenses and install required SDK packages
RUN yes | sdkmanager --licenses && \
    sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.2"

WORKDIR /app

# Keep container alive
CMD ["tail", "-f", "/dev/null"]
