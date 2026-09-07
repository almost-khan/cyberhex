# Let's Encrypt SSL Setup Guide for almostkhan.me

## Prerequisites
- A VPS or dedicated server with root access
- Domain `almostkhan.me` pointing to your server's IP address
- Web server (Nginx or Apache) installed and configured

## Method 1: Using Certbot (Recommended)

### Step 1: Install Certbot

For Ubuntu/Debian:
```bash
sudo apt update
sudo apt install certbot
```

For CentOS/RHEL:
```bash
sudo yum install epel-release
sudo yum install certbot
```

For macOS (using Homebrew):
```bash
brew install certbot
```

### Step 2: Get SSL Certificate

#### For Nginx:
```bash
sudo certbot --nginx -d almostkhan.me -d www.almostkhan.me
```

#### For Apache:
```bash
sudo certbot --apache -d almostkhan.me -d www.almostkhan.me
```

#### Standalone (if no web server plugin):
```bash
sudo certbot certonly --standalone -d almostkhan.me -d www.almostkhan.me
```

### Step 3: Configure Web Server

#### Nginx Configuration Example:
```nginx
server {
    listen 80;
    server_name almostkhan.me www.almostkhan.me;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name almostkhan.me www.almostkhan.me;
    
    ssl_certificate /etc/letsencrypt/live/almostkhan.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/almostkhan.me/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Document root
    root /var/www/almostkhan/public;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### Step 4: Auto-renewal Setup

Add to crontab:
```bash
sudo crontab -e
```

Add this line:
```
0 12 * * * /usr/bin/certbot renew --quiet
```

## Method 2: Using Cloudflare (Alternative)

If you prefer not to manage certificates on your server:

1. Sign up for Cloudflare (free)
2. Add your domain `almostkhan.me`
3. Update your domain's nameservers to Cloudflare's
4. Enable "Always Use HTTPS" in SSL/TLS settings
5. Set SSL mode to "Full" or "Full (strict)"

## Method 3: GitHub Pages with Custom Domain

If you're using GitHub Pages:

1. In your GitHub repository settings, enable "Enforce HTTPS"
2. GitHub Pages now automatically provides SSL for custom domains
3. Update your Hexo config to use HTTPS:

```yaml
# In _config.yml
url: https://almostkhan.me
```

## Testing SSL

After setup, test your SSL configuration:

```bash
# Test certificate
openssl s_client -connect almostkhan.me:443 -servername almostkhan.me

# Test with curl
curl -I https://almostkhan.me

# Online SSL checker
# Visit: https://www.ssllabs.com/ssltest/
```

## Troubleshooting

### Common Issues:

1. **Port 80/443 not open**: Ensure firewall allows these ports
2. **Domain not pointing to server**: Check DNS settings
3. **Web server not running**: Start nginx/apache before running certbot
4. **Certificate renewal fails**: Check cron job and certbot logs

### Useful Commands:

```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# View certbot logs
sudo journalctl -u certbot

# Check web server status
sudo systemctl status nginx
sudo systemctl status apache2
```

## Security Headers

Add these security headers to your web server configuration:

```nginx
# Nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

This will ensure your site is secure and follows HTTPS best practices. 