FROM php:8.3-fpm-alpine

WORKDIR /app

# Install system dependencies (keep build tools for PECL)
RUN apk add --no-cache \
    git \
    curl \
    libpq-dev \
    postgresql-client \
    autoconf \
    build-base \
    && docker-php-ext-install pdo pdo_pgsql \
    && pecl install redis \
    && docker-php-ext-enable redis

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copy project files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --prefer-dist

# Create cache and log directories
RUN mkdir -p var/cache var/log && chmod -R 777 var

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
