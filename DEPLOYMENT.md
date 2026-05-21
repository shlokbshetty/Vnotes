# VNotes Deployment Guide

## Deployment Options

### 1. Local Development

```bash
# Install dependencies
npm install

# Run preflight checks
npm run predev

# Start development servers
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## 2. Docker Deployment (Recommended)

### Prerequisites
- Docker installed
- Docker Compose installed

### Quick Start

```bash
# Build and start containers
docker-compose up

# Or build first, then start
docker-compose build
docker-compose up
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Run specific service
docker-compose up backend
```

### Environment Variables in Docker

Edit `docker-compose.yml` to customize:

```yaml
environment:
  - NODE_ENV=production
  - PORT=3001
  - CORS_ORIGIN=http://localhost:3000
```

---

## 3. Production Build

### Build Application

```bash
# Build both frontend and backend
npm run build

# Or individually
cd backend && npm run build
cd frontend && npm run build
```

### Start Production Server

```bash
# Set environment
export NODE_ENV=production
export PORT=3001

# Start backend
cd backend
npm start

# In another terminal, serve frontend
cd frontend
npx serve -s dist -l 3000
```

---

## 4. Cloud Deployment

### Heroku

#### Prerequisites
- Heroku CLI installed
- Heroku account

#### Deployment Steps

```bash
# Login to Heroku
heroku login

# Create app
heroku create vnotes-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://vnotes-app.herokuapp.com

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Procfile

Create `Procfile` in root:

```
web: cd backend && npm start
```

### AWS EC2

#### Prerequisites
- AWS account
- EC2 instance running Ubuntu 20.04+
- SSH access to instance

#### Deployment Steps

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <repository-url>
cd vnotes

# Install dependencies
npm install

# Build application
npm run build

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start backend/dist/server.js --name "vnotes-backend"
pm2 start "npx serve -s frontend/dist -l 3000" --name "vnotes-frontend"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on reboot
pm2 startup
```

#### Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt-get install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/vnotes
```

```nginx
upstream backend {
    server localhost:3001;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/vnotes /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Google Cloud Platform

#### Prerequisites
- GCP account
- gcloud CLI installed

#### Deployment Steps

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Create App Engine app
gcloud app create

# Deploy
gcloud app deploy

# View logs
gcloud app logs read -f
```

#### app.yaml

Create `app.yaml` in root:

```yaml
runtime: nodejs18

env: standard

handlers:
  - url: /api/.*
    script: auto
    secure: always
  - url: /uploads/.*
    script: auto
    secure: always
  - url: /.*
    static_files: frontend/dist/index.html
    upload: frontend/dist/index.html
    secure: always
  - url: /
    static_dir: frontend/dist
    secure: always

env_variables:
  NODE_ENV: "production"
  CORS_ORIGIN: "https://YOUR_PROJECT_ID.appspot.com"
```

### Azure App Service

#### Prerequisites
- Azure account
- Azure CLI installed

#### Deployment Steps

```bash
# Login to Azure
az login

# Create resource group
az group create --name vnotes-rg --location eastus

# Create App Service plan
az appservice plan create --name vnotes-plan --resource-group vnotes-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group vnotes-rg --plan vnotes-plan --name vnotes-app --runtime "NODE|18.0"

# Deploy from GitHub
az webapp deployment source config-zip --resource-group vnotes-rg --name vnotes-app --src deployment.zip
```

---

## 5. Environment Configuration

### Backend Environment Variables

```env
# Server
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGIN=https://your-domain.com

# File Upload
UPLOADS_DIR=/var/uploads
MAX_FILE_SIZE=524288000

# Future: Transcription
ELEVENLABS_API_KEY=your_api_key
```

### Frontend Environment Variables

```env
# API
VITE_API_URL=https://api.your-domain.com

# Features
VITE_ENABLE_TRANSCRIPTION=false
```

---

## 6. Database Setup (Future)

### MongoDB

```bash
# Install MongoDB
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb

# Create database
mongo
> use vnotes
> db.recordings.createIndex({ createdAt: -1 })
```

### PostgreSQL

```bash
# Install PostgreSQL
sudo apt-get install -y postgresql

# Create database
sudo -u postgres createdb vnotes

# Create user
sudo -u postgres createuser vnotes_user
```

---

## 7. SSL/TLS Certificate

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Update Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # ... rest of config
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 8. Monitoring & Logging

### PM2 Monitoring

```bash
# Install PM2 Plus
pm2 install pm2-auto-pull

# Monitor
pm2 monit

# View logs
pm2 logs vnotes-backend
pm2 logs vnotes-frontend
```

### Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

### Application Logs

```bash
# Backend logs (structured)
# Logs are output to console and can be captured by PM2

# Frontend logs
# Check browser console for errors
```

---

## 9. Backup & Recovery

### Backup Uploads

```bash
# Create backup
tar -czf vnotes-uploads-backup.tar.gz /var/uploads

# Upload to cloud storage
aws s3 cp vnotes-uploads-backup.tar.gz s3://your-bucket/backups/
```

### Backup Metadata

```bash
# Backup recordings.json
cp backend/src/data/recordings.json recordings.json.backup

# Upload to cloud storage
aws s3 cp recordings.json.backup s3://your-bucket/backups/
```

### Restore from Backup

```bash
# Restore uploads
tar -xzf vnotes-uploads-backup.tar.gz -C /

# Restore metadata
cp recordings.json.backup backend/src/data/recordings.json
```

---

## 10. Performance Optimization

### Nginx Caching

```nginx
# Cache static files
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Gzip compression
gzip on;
gzip_types text/plain text/css text/javascript application/json;
gzip_min_length 1000;
```

### CDN Integration

```bash
# CloudFlare
# 1. Add domain to CloudFlare
# 2. Update nameservers
# 3. Enable caching rules
```

---

## 11. Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Permission Denied

```bash
# Fix permissions
sudo chown -R $USER:$USER /var/uploads
chmod -R 755 /var/uploads
```

### Out of Memory

```bash
# Check memory usage
free -h

# Increase swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Database Connection Issues

```bash
# Check database status
sudo systemctl status mongodb
sudo systemctl status postgresql

# Restart database
sudo systemctl restart mongodb
sudo systemctl restart postgresql
```

---

## 12. Scaling Strategies

### Horizontal Scaling

```bash
# Load balancer (HAProxy)
sudo apt-get install haproxy

# Configure multiple backend instances
# Update HAProxy config to distribute traffic
```

### Vertical Scaling

```bash
# Increase server resources
# - CPU cores
# - RAM
# - Storage
```

### Database Scaling

```bash
# Replication
# - Master-slave setup
# - Read replicas

# Sharding
# - Partition data by user/date
```

---

## 13. Security Hardening

### Firewall

```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### SSH Hardening

```bash
# Disable password auth
sudo nano /etc/ssh/sshd_config
# PasswordAuthentication no

# Restart SSH
sudo systemctl restart ssh
```

### Application Security

```bash
# Update dependencies
npm audit fix

# Enable HTTPS only
# Set secure headers
# Implement rate limiting
```

---

## 14. Maintenance

### Regular Updates

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade

# Update Node.js
sudo apt-get install nodejs

# Update dependencies
npm update
```

### Database Maintenance

```bash
# MongoDB
db.runCommand({ compact: 'recordings' })

# PostgreSQL
VACUUM ANALYZE;
```

### Log Rotation

```bash
# Configure logrotate
sudo nano /etc/logrotate.d/vnotes

# Example:
/var/log/vnotes/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database setup (if applicable)
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Logging configured
- [ ] Performance optimized
- [ ] Security hardened
- [ ] Health checks verified
- [ ] Load testing completed
- [ ] Rollback plan ready

---

## Support & Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Last Updated**: May 2026
**Version**: 1.0.0
