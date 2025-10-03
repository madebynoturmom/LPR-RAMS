# Quick EC2 Deployment Guide

## One-Command Deployment

After cloning the repo on your EC2 instance, run:

```bash
./scripts/ec2-deploy.sh
```

This single script will:
1. ✅ Check PostgreSQL is running
2. ✅ Install dependencies
3. ✅ Push database schema
4. ✅ Seed with sample data
5. ✅ Build the application

## Manual Step-by-Step

If you prefer to do it manually:

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cat > .env << EOF
DATABASE_URL=postgresql://dev:2240@localhost:5432/lpr
PUBLIC_BASE_URL=http://your-ec2-ip:5174
NODE_ENV=production
EOF

# 3. Push database schema
npm run db:push

# 4. Seed database
npm run seed

# 5. Build
npm run build

# 6. Start with PM2
pm2 start npm --name lpr-app -- start
pm2 save
```

## What You Get

After seeding, you get a fully populated database:

### 🔐 Admin Access
- Username: `admin`
- Password: `admin123`
- Full access to manage everything

### 🏘️ 5 Ready-to-Use Residents
- Usernames: `john.doe`, `jane.smith`, `bob.wilson`, `alice.brown`, `charlie.davis`
- Password: `resident123`
- Each with unit number and registered vehicle

### 💂 3 Guards (24/7 Coverage)
- Usernames: `alice.guard`, `bob.guard`, `carlos.guard`
- Password: `guard123`
- Covering morning, afternoon, and night shifts

### 🚗 5 Registered Vehicles
- All active and ready for LPR scanning

### 🎫 2 Sample Guest Passes
- Active passes for testing

## Test Login

```bash
# After deployment, visit:
http://your-ec2-ip:5174/login

# Login as admin:
Username: admin
Password: admin123

# Or as a resident:
Username: john.doe
Password: resident123
```

## Security Reminders

⚠️ **Before going live:**

1. Change default passwords
2. Update `.env` with production values
3. Set up SSL/TLS (use Let's Encrypt)
4. Configure firewall properly
5. Enable database backups
6. Use strong passwords

## Useful Commands

```bash
# View app logs
pm2 logs lpr-app

# Restart app
pm2 restart lpr-app

# Check status
pm2 status

# Re-seed database (fresh start)
npm run seed
```

## Need More Help?

- Full guide: [EC2_DEPLOYMENT.md](EC2_DEPLOYMENT.md)
- Scripts documentation: [scripts/README.md](scripts/README.md)
- Main README: [README.md](README.md)

---

**Happy Deploying! 🚀**
