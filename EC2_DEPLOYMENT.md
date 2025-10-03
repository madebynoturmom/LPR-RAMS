# EC2 Deployment Guide with Database Seeding

## Quick Start (After Initial Deployment)

After deploying your application to EC2, run this single command to populate the database:

```bash
npm run seed
```

Or using the shell script:

```bash
./scripts/seed.sh
```

## What Gets Created

### 🏠 Residence
- **Name:** Sunset Villa
- **ID:** RES-001
- **Address:** 123 Palm Beach Drive, Miami, FL 33139

### 👤 Admin User
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** admin@sunsetvilla.com
- **Phone:** 555-0100

### 🏘️ Residents (5)
All residents have the password: `resident123`

| Username | Name | Email | Phone | Unit | Car Plate |
|----------|------|-------|-------|------|-----------|
| john.doe | John Doe | john.doe@email.com | 555-0201 | A101 | ABC-1234 |
| jane.smith | Jane Smith | jane.smith@email.com | 555-0202 | A102 | XYZ-5678 |
| bob.wilson | Bob Wilson | bob.wilson@email.com | 555-0203 | B201 | DEF-9012 |
| alice.brown | Alice Brown | alice.brown@email.com | 555-0204 | B202 | GHI-3456 |
| charlie.davis | Charlie Davis | charlie.davis@email.com | 555-0205 | C301 | JKL-7890 |

### 💂 Guards (3)
| Guard ID | Name | Phone | Shift |
|----------|------|-------|-------|
| G-001 | Alice Smith | 555-0101 | Morning (6AM-2PM) |
| G-002 | Bob Johnson | 555-0102 | Afternoon (2PM-10PM) |
| G-003 | Carlos Ruiz | 555-0103 | Night (10PM-6AM) |

### 🚗 Vehicles (5)
All 5 resident vehicles are automatically registered with their respective plate numbers.

### 🎫 Guest Passes (2)
- Michael Thompson - MNO-1111 (Valid for 24 hours)
- Sarah Martinez - PQR-2222 (Valid for 24 hours)

## Full EC2 Deployment Steps

### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE lpr;
CREATE USER dev WITH PASSWORD '2240';
GRANT ALL PRIVILEGES ON DATABASE lpr TO dev;
\q
```

### 3. Clone and Setup Application

```bash
# Clone repository
git clone https://github.com/madebynoturmom/LPR-RAMS.git
cd LPR-RAMS

# Install dependencies
npm install

# Set environment variables
cat > .env << EOF
DATABASE_URL=postgresql://dev:2240@localhost:5432/lpr
PUBLIC_BASE_URL=http://your-ec2-ip:5174
EOF

# Push database schema
npm run db:push

# Seed the database
npm run seed
```

### 4. Build and Start

```bash
# Build the application
npm run build

# Start with PM2
pm2 start npm --name "lpr-app" -- start
pm2 save
pm2 startup
```

### 5. Configure Firewall

```bash
# Allow HTTP and app port
sudo ufw allow 80
sudo ufw allow 5174
sudo ufw allow 22
sudo ufw enable
```

## Testing the Deployment

After seeding, you can immediately:

1. **Login as Admin:**
   - Navigate to: `http://your-ec2-ip:5174/login`
   - Username: `admin`
   - Password: `admin123`

2. **Login as Resident:**
   - Use any of the 5 resident usernames (e.g., `john.doe`)
   - Password: `resident123`

3. **Test Features:**
   - View all 5 residents in Admin Dashboard
   - Check 5 registered vehicles
   - See 3 guards on duty
   - View 2 active guest passes

## Re-seeding

If you need to reset the database:

```bash
# Drop and recreate database
sudo -u postgres psql -c "DROP DATABASE lpr;"
sudo -u postgres psql -c "CREATE DATABASE lpr;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lpr TO dev;"

# Push schema and re-seed
npm run db:push
npm run seed
```

## Environment Variables

Make sure these are set in your `.env` file:

```env
DATABASE_URL=postgresql://dev:2240@localhost:5432/lpr
PUBLIC_BASE_URL=http://your-ec2-ip:5174
NODE_ENV=production
```

## Useful Commands

```bash
# View logs
pm2 logs lpr-app

# Restart application
pm2 restart lpr-app

# Stop application
pm2 stop lpr-app

# Database studio (development)
npm run db:studio
```

## Security Notes

⚠️ **Important:** After deployment, you should:

1. Change the default admin password
2. Update all default passwords in production
3. Configure proper firewall rules
4. Set up SSL/TLS certificates
5. Use environment-specific passwords
6. Enable database backups

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Application Not Starting
```bash
# Check PM2 status
pm2 status

# View detailed logs
pm2 logs lpr-app --lines 100
```

### Port Already in Use
```bash
# Find process using port 5174
sudo lsof -i :5174

# Kill the process
sudo kill -9 <PID>
```
