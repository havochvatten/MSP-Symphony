# Local Development Setup Guide (Windows + WSL2)

*	[Quick Daily Start (After Initial Setup)](#quick-daily-start-after-initial-setup)
*	[Initial Setup](#initial-setup)  
    1\. [Prerequisites](#1-prerequisites)  
    2. [Install and Configure WSL2 + Ubuntu](#2-install-and-configure-wsl2--ubuntu)  
    3. [Clone the MSP-Symphony Repository](#3-clone-the-msp-symphony-repository)  
    4. [PostgreSQL + PostGIS Setup (with Baseline Data)](#4-postgresql--postgis-setup)  
    - 4.1 [Start and Enable PostgreSQL](#41-start-and-enable-postgresql)
    - 4.2 [Configure Authentication and connections](#42-configure-authentication-and-connections)
    - 4.3 [Create Database User, Database and Enable PostGIS](#43-create-database-user-database-and-enable-postgis)
    - 4.4 [Populate Database](#44-populate-database)

    5\. [Install WildFly 39.0.1.Final](#5-install-wildfly-3901final)  
    6. [Deploy PostgreSQL JDBC Driver](#6-deploy-postgresql-jdbc-driver)  
    7. [Configure WildFly (Datasource + Security)](#7-configure-wildfly-datasource--security)  
    8. [Add Application User for Login](#8-add-application-user-for-login)  
    9. [Create and Populate Cache, Config and Data Directories](#9-create-and-populate-cache-config-and-data-directories)
    - 9.1 [Cache directories](#91-cache-directories)
    - 9.2 [Config directory](#92-config-directory)
    - 9.3 [Data directory](#93-data-directory)

    10\. [Optimize WildFly JVM Settings](#10-optimize-wildfly-jvm-settings)  
    11. [Build and Deploy Backend](#11-build-and-deploy-backend)  
    12. [Frontend Setup](#12-frontend-setup)
*	[Troubleshooting](#troubleshooting)
    * [Postgresql / Database](#postgresql--database)
    * [Wildfly / Backend](#wildfly--backend)

_Tested on_: Windows 11 + WSL2 (Ubuntu 22.04/24.04)  
_Target_: WildFly 39 + PostgreSQL 16 + PostGIS + Angular frontend
 
## Quick Daily Start (After Initial Setup)
#### Terminal 1 – Postgresql
```sh
sudo service postgresql start
```

#### Terminal 2 – WildFly
```sh
cd ~/repos/MSP-Symphony/symphony-ws
mvn clean package -DskipTests
cp target/*.war $WILDFLY_HOME/standalone/deployments/ 
$WILDFLY_HOME/bin/standalone.sh -c standalone-full.xml 
Terminal 3 – Frontend
cd ~/repos/MSP-Symphony/frontend
ng serve --proxy-config proxy.conf.json --ssl=false
```

Open browser → http://localhost:4200
 
## Initial Setup
### 1. Prerequisites
* Windows 10/11 with WSL2 enabled (wsl --install)
*	At least 16 GB RAM (32 GB strongly recommended)
*	Administrator rights on Windows
 
### 2. Install and Configure WSL2 + Ubuntu
In PowerShell (as Administrator):
```powershell
wsl --install
wsl --set-default-version 2 
Open Ubuntu (terminal) and run:
sudo apt update && sudo apt upgrade -y
sudo apt install openjdk-17-jdk maven postgresql postgresql-contrib postgis 
gdal-bin unzip wget curl git -y 
```
 
### 3. Clone the MSP-Symphony Repository
Create a dedicated folder for repositories (if you don't already have one):
```sh
mkdir -p ~/repos
```
Clone the repository:
```sh
cd ~/repos
git clone https://github.com/havochvatten/MSP-Symphony.git
```
(Optional) if you are using a fork, clone it instead:
```sh
git clone https://github.com/YOURUSERNAME/MSP-Symphony.git
```

## 4. PostgreSQL + PostGIS Setup
### 4.1 Start and Enable PostgreSQL 
```sh
sudo systemctl enable --now postgresql 
```
Then set a password:
```sh
sudo -u postgres psql 
ALTER USER postgres WITH PASSWORD 'YourStrongPasswordHere!'; 
exit
```
### 4.2 Configure Authentication and connections
Edit the PostgreSQL authentication file  (adjust version number if not 16):
```sh
sudo nano /etc/postgresql/16/main/pg_hba.conf
```
Replace or ensure the file contains the following related to postgres and symphony:
pg_hba.conf 

#### Database administrative login by Unix domain socket
`local   all             postgres                                scram-sha-256`

#### Specific rule for the symphony application user (local socket)
`local   symphony        symphony                                scram-sha-256`

#### "local" is for Unix domain socket connections only
`local   all             all                                     peer`

#### Allow connections from Windows host (important for WSL)
`host    all             all             0.0.0.0/0               scram-sha-256`

#### IPv4 local connections
`host    all             all             127.0.0.1/32            scram-sha-256`

#### IPv6 local connections
`host    all             all             ::1/128                 scram-sha-256`

#### Replication (default)
`local   replication     all                                     peer`  
`host    replication     all             127.0.0.1/32            scram-sha-256`  
`host    replication     all             ::1/128                 scram-sha-256`

Save and exit, then restart PostgreSQL:

```sh
sudo systemctl restart postgresql
```
### 4.3 Create Database User, Database and Enable PostGIS 
```sh
sudo -u postgres psql << EOF
CREATE USER symphony WITH PASSWORD 'symphony';
CREATE DATABASE symphony OWNER symphony;
\c symphony
CREATE EXTENSION IF NOT EXISTS postgis;
GRANT ALL PRIVILEGES ON DATABASE symphony TO symphony;
GRANT ALL ON SCHEMA public TO symphony;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO symphony;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO symphony;
EOF
```
### 4.4 Populate Database
The database should be populated with a specific dataset referencing GeoTIFF data rasters, referred to as 'Baseline's or `BaselineVersion`s.
A "streamlined" instruction to accomplish this will be included here shortly.
[A separate tool](https://github.com/havochvatten/symphony-import) to facilitate this step is currently in development.

_( TODO! Write generic "quickstart" instruction utilizing [symphony-import-tool](https://github.com/havochvatten/symphony-import) )_

### 5. Install WildFly 39.0.1.Final 
Download and install:
```sh
cd ~
wget 
https://github.com/wildfly/wildfly/releases/download/39.0.1.Final/wildfly-39.0.1.Final.tar.gz
sudo mkdir -p /opt/wildfly
sudo tar -xzf wildfly-39.0.1.Final.tar.gz -C /opt/wildfly --strip-
components=1
sudo chown -R $USER:$USER /opt/wildfly
sudo ln -s /opt/wildfly /opt/wildfly-current
```
Set environment variables:
```sh
echo 'export WILDFLY_HOME=/opt/wildfly-current' >> ~/.bashrc
echo 'export PATH=$WILDFLY_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc 
```

### 6. Deploy PostgreSQL JDBC Driver
```sh
cd $WILDFLY_HOME/standalone/deployments
wget https://jdbc.postgresql.org/download/postgresql-42.7.4.jar -O postgresql.jar 
```

### 7. Configure WildFly (Datasource + Security)
Start WildFly:  
```sh
$WILDFLY_HOME/bin/standalone.sh -c standalone-full.xml 
```
In another terminal, add Management User:  
```sh
$WILDFLY_HOME/bin/add-user.sh
```
Then configure datasource and security domain:  
```sh
$WILDFLY_HOME/bin/jboss-cli.sh --connect
```
Run this and copy the result (most likely /opt/wildfly-current)  
```
echo $WILDFLY_HOME
```
Paste the following commands (replace /opt/wildfly-current if needed):

Wildfly client ([jboss-cli](https://docs.redhat.com/en/documentation/red_hat_jboss_enterprise_application_platform/7.4/html-single/management_cli_guide/index)) commands:
```jboss-cli
module add --name=org.postgresql --resources=/opt/wildfly-
current/standalone/deployments/postgresql.jar --
dependencies=javax.api,javax.transaction.api

/subsystem=datasources/jdbc-driver=postgresql:add(driver-name=postgresql, 
driver-module-name=org.postgresql, driver-class-name=org.postgresql.Driver, 
driver-xa-datasource-class-name=org.postgresql.xa.PGXADataSource)

data-source add --name=SymphonyDS --jndi-name=java:/SymphonyDS --driver-
name=postgresql --connection-url=jdbc:postgresql://localhost:5432/symphony --
user-name=symphony --password=symphony --enabled=true --use-ccm=true --max-
pool-size=20

/subsystem=datasources/data-source=SymphonyDS:write-attribute(name=valid-
connection-checker-class-
name,value=org.jboss.jca.adapters.jdbc.extensions.postgres.PostgreSQLValidCon
nectionChecker)
/subsystem=datasources/data-source=SymphonyDS:write-attribute(name=exception-
sorter-class-
name,value=org.jboss.jca.adapters.jdbc.extensions.postgres.PostgreSQLValidCon
nectionChecker)
/subsystem=datasources/data-source=SymphonyDS:write-
attribute(name=background-validation,value=true)

/subsystem=elytron/filesystem-realm=fs-realm:add(path=application-
users.properties, relative-to=jboss.server.config.dir, levels=0)
/subsystem=elytron/security-domain=LDAPAuth:add(default-realm=fs-realm, 
permission-mapper=default-permission-mapper, realms=[{realm=fs-realm, role-
decoder=groups-to-roles}])
/subsystem=elytron/http-authentication-factory=ldapauth-http-auth:add(http-
server-mechanism-factory=global, security-domain=LDAPAuth)
/subsystem=undertow/application-security-domain=LDAPAuth:add(security-
domain=LDAPAuth)
```
Exit by typing `exit` and hitting enter.
 
### 8. Add Application User for Login 
```sh
$WILDFLY_HOME/bin/add-user.sh
```
**Choose** (b) Application User  
`Username: testuser`  
`Password: testuser123!`  
`Groups: GRP_SYMPHONY,GRP_SYMPHONY_ADMIN` &#8592; important
 
### 9. Create and Populate Cache, Config and Data Directories
#### 9.1 Cache directories
```sh
sudo mkdir -p /app/config/symphony /var/cache/symphony/data
sudo chown -R $USER:$USER /app /var/cache/symphony 
```
#### 9.2 Config directory
Create global properties:  
```sh
nano /app/config/symphony/symphony-global.properties 
```
Content:
```properties
symphony.user=GRP_SYMPHONY
symphony.admin=GRP_SYMPHONY_ADMIN
# Mandatory setting to override specifying which _NationalArea_ definitions to fetch
areas.countrycode=SWE

# Commonness indices below this value will cause the component to be excluded from the calculation report sheet
calc.rarity_index.threshold=0
calc.sankey_chart.link_weight_threshold=0.001

# Some common options are:
# - LZW (fairly quick, decent compression)
# - Deflate (slower, better compression),
# - PackBits (fast, lower compression)
# and then there is ZSTD, JPEG, ZLib, etc. (see 
# GeoTiffWriteParams#getCompressionTypes() for exhaustive list)
calc.result.compression.type=LZW
calc.result.compression.quality=1.00

data.cache_dir=/var/cache/symphony/data

# The below refers to SLD stylesheets stored in resources
data.styles.ecosystem=styles/ecosystem.xml
data.styles.pressure=styles/pressure.xml
data.styles.result=styles/result-style.xml
data.styles.comparison=styles/comparison.xml

data.source.crs=EPSG:3035

# Normally overridden in /app/config/symphony/
api.base_url = http://localhost:8080
api.base_path = /symphony-ws/service
# wss is available if the app server has a valid cert, but since this is used to
# route the internal client connection, ssl is not necessary for localhost.
# (note explicit ipv4, avoiding ipv6 resolution)
socket.base_url = ws://127.0.0.1:8080
#socket.base_url = wss://127.0.0.1:8443

# For domain normalization histogram generation
calc.normalization.histogram.percentile=95

# Size of JAI tile cache. In MB (defaults to 1024 MB)
calc.jai.tilecache.capacity=4096

# Prune calculation results older than this many days
# Disabled by default. Enable by specifying this property,
# setting to 0 will prune as often as possible (once per day)
## calc.dbpurge_calculation_max_age_days=182

meta.default_language=en
```

#### 9.3 Data directory
Automated download + extraction (recommended)  
**Run the following commands in your terminal**:  
Create the target directory
```sh
sudo mkdir -p /app/data/symphony
```
Download the raster package directly
```sh
wget -O /tmp/MSP-Symphony_sv_Baseline2019.zip 
"https://www.havochvatten.se/download/18.5d3a53bc19898be468f88d96/17556123091
64/MSP-Symphony_sv_Baseline2019.zip"
```
Extract everything directly into the correct location
```sh
sudo unzip /tmp/MSP-Symphony_sv_Baseline2019.zip -d /app/data/symphony/
```
Clean up the zip file (optional)
```sh
rm /tmp/MSP-Symphony_sv_Baseline2019.zip
```
Make the entire folder (and all files inside it) readable by everyone, while allowing only the 
owner to modify them  
```sh
sudo chmod -R 755 /app/data/symphony
```
### 10. Optimize WildFly JVM Settings
Edit standalone.conf:
```sh
nano $WILDFLY_HOME/bin/standalone.conf
```
Comment out the existing settings and put Symphony specific ones, so that your `$WILDFLY_HOME/bin/standalone.conf` 
file looks something like this:
```bash
# Specify options to pass to the Java VM.
#
#if [ "x$JBOSS_JAVA_SIZING" = "x" ]; then
#   JBOSS_JAVA_SIZING="-Xms64m -Xmx512m"
#fi
#if [ "x$JAVA_OPTS" = "x" ]; then
#   JAVA_OPTS="$JBOSS_JAVA_SIZING -Djava.net.preferIPv4Stack=true"
#   JAVA_OPTS="$JAVA_OPTS -Djboss.modules.system.pkgs=$JBOSS_MODULES_SYSTEM_PKGS -Djava.awt.headless=true"
#else
#   echo "JAVA_OPTS already set in environment; overriding default settings 
#with values: $JAVA_OPTS"
#fi

# ======================================================================
# MSP-Symphony optimized JVM settings
# ======================================================================

# Default memory settings - feel free to adjust based on your machine.   
# Don't use more than 50% of WSL available RAM memory, as it can cause WSL
# to kill the process.
if [ "x$JBOSS_JAVA_SIZING" = "x" ]; then
   JBOSS_JAVA_SIZING="-Xms2G -Xmx4G"
fi

# Main JAVA_OPTS
if [ "x$JAVA_OPTS" = "x" ]; then
   JAVA_OPTS="$JBOSS_JAVA_SIZING"

   # Important settings for this application
   JAVA_OPTS="$JAVA_OPTS -Dfile.encoding=UTF-8"
   JAVA_OPTS="$JAVA_OPTS -Djava.net.preferIPv4Stack=true"
   JAVA_OPTS="$JAVA_OPTS -
Djboss.modules.system.pkgs=$JBOSS_MODULES_SYSTEM_PKGS"
   JAVA_OPTS="$JAVA_OPTS -Djava.awt.headless=true"

   # Optional: Reduce GC pressure (good for spatial/raster heavy work)
   JAVA_OPTS="$JAVA_OPTS -XX:+UseG1GC"
   JAVA_OPTS="$JAVA_OPTS -XX:MaxGCPauseMillis=200"

else
   echo "JAVA_OPTS already set in environment; overriding default settings with values: $JAVA_OPTS"
fi
```
 
### 11. Build and Deploy Backend 
```sh
cd ~/repos/MSP-Symphony/symphony-ws
mvn clean package -DskipTests
cp target/*.war $WILDFLY_HOME/standalone/deployments/ 
```
 
### 12. Frontend Setup 
Install npm and angular first if you don't have it installed already:  
https://nodejs.org/en/download

#### Download and install nvm:
```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | 
bash
```

in lieu of restarting the shell
```
\. "$HOME/.nvm/nvm.sh"
```

#### Download and install Node.js:
```sh
nvm install 24
```

Verify the Node.js version. Should print version (e.g. `v24.16.0`):
```sh
node -v 
```

Verify npm version. Should print version (e.g. `11.13.0`):
```sh
npm -v
```

#### Install angular client:
```sh
npm install -g @angular/cli
```
Then:
```sh
cd ~/repos/MSP-Symphony/frontend
npm install
```
 
Create proxy.conf.json in /repos/MSP-Symphony/frontend
```json
{
  "/symphony-ws": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

Run frontend:
```sh
ng serve --proxy-config proxy.conf.json --ssl=false
```
 
## Troubleshooting
### PostgreSQL / Database
* Peer authentication failed → Restart PostgreSQL after editing pg_hba.conf 
* ~~Baseline scripts fail → Run them with sudo -u postgres~~  (inadequate, see [TODO](#44-populate-database))
### WildFly / Backend
* Datasource connection fails → Check password and run datasource CLI commands again
* 401 Login error → Re-add application user with correct groups
* areas.countrycode error → Ensure line is uncommented in `/app/config/symphony/symphony-global.properties`  
* Slow layers / cache errors → Verify /var/cache/symphony/data exists and is writable
General
* Application feels slow → Increase -Xmx if you have enough RAM
* Layers don't show correctly → Clear browser cache + reload page
