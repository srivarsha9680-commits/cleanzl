# McClean — OVH VPS Deployment Guide

## Prerequisites
- OVH VPS (Ubuntu 22.04 LTS recommended)
- Domain name pointed to your VPS IP
- SSH access to VPS

---

## 1. Initial VPS Setup

```bash
# Connect to your VPS
ssh root@YOUR_VPS_IP

# Update system
apt update && apt upgrade -y

# Create a non-root user
adduser mcclean
usermod -aG sudo mcclean

# Switch to new user
su - mcclean
```

---

## 2. Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version   # Should be v20+
npm --version
```

---

## 3. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

---

## 4. Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 5. Deploy the Application

```bash
# Create app directory
sudo mkdir -p /var/www/mcclean
sudo chown mcclean:mcclean /var/www/mcclean

# Upload your files (from local machine):
# scp -r ./mcclean/* mcclean@YOUR_VPS_IP:/var/www/mcclean/

# OR clone from git:
# git clone https://github.com/youruser/mcclean.git /var/www/mcclean

cd /var/www/mcclean

# Install dependencies
npm install --production

# Create logs and data directories
mkdir -p logs data

# Set secure admin password in ecosystem config
nano ecosystem.config.js   # Update ADMIN_PASSWORD
```

---

## 6. Configure Nginx

```bash
# Copy nginx config
sudo cp nginx/mcclean.conf /etc/nginx/sites-available/mcclean

# Edit the config — replace yourdomain.com with your actual domain
sudo nano /etc/nginx/sites-available/mcclean

# Enable the site
sudo ln -s /etc/nginx/sites-available/mcclean /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## 7. SSL Certificate (Free with Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically. Test it:
sudo certbot renew --dry-run
```

---

## 8. Start the Application

```bash
cd /var/www/mcclean

# Start with PM2 in production mode
pm2 start ecosystem.config.js --env production

# Save PM2 config to restart on reboot
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# (run the command it outputs)
```

---

## 9. Configure Firewall

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 10. Verify Deployment

```bash
# Check application is running
pm2 status

# Check logs
pm2 logs mcclean

# Test health endpoint
curl https://yourdomain.com/health
```

---

## Managing the App

```bash
# Restart
pm2 restart mcclean

# Stop
pm2 stop mcclean

# View logs
pm2 logs mcclean --lines 100

# Monitor
pm2 monit
```

---

## Admin API

Access bookings and applications via the admin API:

```bash
# List all bookings
curl -H "Authorization: Bearer YOUR_ADMIN_PASSWORD" https://yourdomain.com/api/admin/bookings

# List all applications
curl -H "Authorization: Bearer YOUR_ADMIN_PASSWORD" https://yourdomain.com/api/admin/applications
```

---

## Production Checklist

- [ ] Change `ADMIN_PASSWORD` in `ecosystem.config.js`
- [ ] Update `yourdomain.com` in nginx config
- [ ] SSL certificate installed and auto-renewing
- [ ] Firewall configured
- [ ] PM2 startup configured
- [ ] Set up email service (Nodemailer + SMTP) for real notifications
- [ ] Replace JSON file storage with PostgreSQL or MongoDB for scale
- [ ] Set up backups for `/var/www/mcclean/data/`
- [ ] Monitor with `pm2 monit` or integrate Datadog/Grafana

---

## Next Steps for Full Production

1. **Email notifications**: Add Nodemailer with an SMTP provider (e.g. Mailgun, SendGrid)
2. **Database**: Replace `data/*.json` with PostgreSQL (`pg` npm package)
3. **Payments**: Integrate Stripe for booking payments
4. **Authentication**: Add JWT-based auth for customer/cleaner accounts
5. **Dashboard**: Build admin panel at `/admin`
