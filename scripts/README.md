# LPR-RAMS Database Seeding Scripts

This directory contains scripts to quickly populate your database with sample data for development and deployment.

## Quick Start

### Seed the Database

```bash
npm run seed
```

Or using the shell script:

```bash
./scripts/seed.sh
```

### EC2 Full Deployment

```bash
./scripts/ec2-deploy.sh
```

This will:
1. Check PostgreSQL is running
2. Install dependencies
3. Push database schema
4. Seed with sample data
5. Build the application

## What Gets Created

The seeding script populates your database with:

### 🏠 1 Residence
- **Sunset Villa** (RES-001)
- Complete with address, phone, and email

### 👤 1 Admin User
- **Username:** `admin`
- **Password:** `admin123`
- Full admin access to manage the residence

### 🏘️ 5 Residents
- All with password: `resident123`
- Each assigned to a unit (A101, A102, B201, B202, C301)
- Each with a registered vehicle

| Username | Name | Unit | Vehicle |
|----------|------|------|---------|
| john.doe | John Doe | A101 | ABC-1234 |
| jane.smith | Jane Smith | A102 | XYZ-5678 |
| bob.wilson | Bob Wilson | B201 | DEF-9012 |
| alice.brown | Alice Brown | B202 | GHI-3456 |
| charlie.davis | Charlie Davis | C301 | JKL-7890 |

### 💂 3 Guards
- All with password: `guard123`
- Covering 24/7 shifts

| Username | Name | Shift |
|----------|------|-------|
| alice.guard | Alice Smith | 06:00-14:00 |
| bob.guard | Bob Johnson | 14:00-22:00 |
| carlos.guard | Carlos Ruiz | 22:00-06:00 |

### 🚗 5 Vehicles
- Automatically registered for each resident
- All marked as active

### 🎫 2 Guest Passes
- Active for 24 hours
- One visitor pass, one delivery pass

## Available Scripts

### `seed-database.ts`
Main seeding script that populates the database with all sample data.

```bash
npm run seed
# or
tsx scripts/seed-database.ts
```

### `seed.sh`
Shell wrapper for the seeding script with dependency checks.

```bash
./scripts/seed.sh
```

### `ec2-deploy.sh`
Complete deployment script for EC2 instances.

```bash
./scripts/ec2-deploy.sh
```

## Usage Examples

### First-Time Setup

```bash
# 1. Clone repository
git clone https://github.com/madebynoturmom/LPR-RAMS.git
cd LPR-RAMS

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Push database schema
npm run db:push

# 5. Seed database
npm run seed

# 6. Start development server
npm run dev
```

### Re-seeding (Fresh Start)

```bash
# Drop all tables
npm run db:push

# Re-seed
npm run seed
```

### Production Deployment on EC2

```bash
# One command to do everything
./scripts/ec2-deploy.sh

# Or manually:
npm run db:push
npm run seed
npm run build
npm start
```

## Testing After Seeding

After seeding, you can immediately:

1. **Login as Admin:**
   - URL: `http://localhost:5174/login`
   - Username: `admin`
   - Password: `admin123`

2. **Login as Resident:**
   - Username: Any of `john.doe`, `jane.smith`, etc.
   - Password: `resident123`

3. **Login as Guard:**
   - Username: Any of `alice.guard`, `bob.guard`, `carlos.guard`
   - Password: `guard123`

4. **Verify Data:**
   - Check admin dashboard for all residents
   - View registered vehicles
   - See active guards
   - Check guest passes

## Environment Variables

Make sure these are set in your `.env`:

```env
DATABASE_URL=postgresql://dev:2240@localhost:5432/lpr
PUBLIC_BASE_URL=http://localhost:5174
NODE_ENV=development
```

## Troubleshooting

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

### "Database does not exist"
```bash
# Create the database
sudo -u postgres createdb lpr

# Grant permissions
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lpr TO dev;"
```

### "tsx command not found"
```bash
# Install tsx
npm install -D tsx
```

### Start Fresh
```bash
# Drop and recreate database
sudo -u postgres psql -c "DROP DATABASE lpr;"
sudo -u postgres psql -c "CREATE DATABASE lpr;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lpr TO dev;"

# Push schema and re-seed
npm run db:push
npm run seed
```

## Security Notes

⚠️ **Important:** The default passwords are for development only!

In production:
1. Change all default passwords immediately
2. Use strong, unique passwords
3. Enable proper authentication
4. Set up SSL/TLS
5. Configure firewall rules
6. Enable database backups

## Additional Scripts

Other useful scripts in this directory:

- `set-guard-default-passwords.ts` - Reset guard passwords
- `expire-guest-passes.ts` - Expire old guest passes
- `create-resident.ts` - Add a single resident
- `create-guard.ts` - Add a single guard
- `test-email.ts` - Test email configuration

## Need Help?

See the full deployment guide: [EC2_DEPLOYMENT.md](../EC2_DEPLOYMENT.md)
