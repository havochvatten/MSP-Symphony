# Symphony: A tool for ecosystem-based marine spatial planning

Symphony is a method developed by the Swedish Agency for Marine and Water Management (SwAM), to quantitatively weigh 
ecosystems and environmental pressures. With Symphony, the cumulative environmental impact from different marine spatial
planning (MSP) options can be objectively compared. Cumulative environmental impact refers to the combined pressure from
different kinds of human activities on the marine ecosystems. This cumulative impact indicates the consequences for the
environment. In this way, marine spatial plans can be developed with an ecosystem approach.

This repository contains a specific implementation conceived as an application facilitating building and evaluation 
of Symphony scenarios, initially developed at the agency in-house during the years 2019-2022. For more details on 
the science behind the Symphony method see the [project web page at the Swedish Agency for Marine and Water Management](https://www.havochvatten.se/en/eu-and-international/marine-spatial-planning/swedish-marine-spatial-planning/the-marine-spatial-planning-process/development-of-plan-proposals/symphony---a-tool-for-ecosystem-based-marine-spatial-planning.html).

## Architectural overview

The system has been conceived according to SWaM development standards. In concrete terms this implies a standard web 
architecture with a Jakarta EE-based backend coupled with a frontend built as an SPA 
using Angular. Persistent data is managed using JPA and stored in a PostgreSQL database (with spatial extensions) and 
raster data on a filesystem.    

### Implementation recommendations

While any Jakarta EE 8.0-compliant application should be OK, during development [Wildfly](https://www.wildfly.org/)
has been used and is thus the recommended choice. At SwAM the frontend is served separately using Apache, 
although any web server capable of serving static content should do (see [Frontend](#frontend) below). The system has been 
developed using Wildfly 18, PostgreSQL 10 and PostGIS v2.4, but more recent versions should be fine.

## Getting the source

The repository contains raster files in GeoTIFF format used by some tests. These have been configured to be stored 
using [Git LFS](https://git-lfs.github.com/). See the Git LFS website for installation instructions, but typically 
you need to enable LFS support for account prior to cloning the repository like so:
```
git lfs install
```

## Building

### Backend

The backend is located in the `symphony-ws` directory and is standard single-module Maven project. Building 
should 
be a 
matter of:
```
cd symphony-ws
mvn package -DskipTests
```
The build artifacts will end up in the `target` directory.

There are also tests which can be invoked by Maven, see the section on [Tests](#testing) below.

### Frontend

The frontend is managed by Angular CLI, and should thus behave like any other Angular CLI-project. There is 
more extensive information in [frontend/README](frontend/README.md), but in 
short a production build should be a matter of:
```
cd frontend
npm install -g @angular/cli
npm install
ng build
```
The build artifacts will end up in the `frontend/dist` directory.

For frontend development there is also the Angular CLI development server, see the frontend README for more details. 

## Configuration and Deployment

### Backend

There are a few steps needed to get the backend up and running:

#### 1. Configure the application server

The system has only been tested in Wildfly and its standalone mode, using the `standalone-full.xml` configuration. At 
least two things need be added to the stock Wildfly configuration:
1. A *SymphonyDS* data source
2. A security domain. By default, the security domain is called *LDAPAuth* in the `jboss-web.xml` file.  

In the case of Wildfly, the data source may be added through the Wildfly CLI, through the web-based management 
console, or directly in the configuration file as the below XML fragment:

```
<datasource jndi-name="java:/SymphonyDS" pool-name="SymphonyDS">
    <connection-url>jdbc:postgresql://DATABASE-HOST:5432/symphony</connection-url>
    <driver>postgresql</driver>
    <security>
        <user-name>DATABASE-USER</user-name>
        <password>DATABASE-USER-PASSWORD</password>
    </security>
    <validation>
        <valid-connection-checker class-name="org.jboss.jca.adapters.jdbc.extensions.postgres.PostgreSQLValidConnectionChecker"/>
        <background-validation>true</background-validation>
        <exception-sorter class-name="org.jboss.jca.adapters.jdbc.extensions.postgres.PostgreSQLValidConnectionChecker"/>
    </validation>
</datasource>
```
As for the security domain, it would depend on the needs of your organisation and installation environment. For an 
example of a simple setup relying only on a separate filesystem user database see for instance
[this guide](http://www.mastertheboss.com/jbossas/jboss-security/configuring-http-basic-authentication-with-wildfly/).

#### 2. Populate the database

In order for the system to work the database need to be populated with data. Separate instructions for this 
procedure is provided in [DataImportREADME](database/DataImportREADME.txt).

#### 3. (Optional) Override the application runtime configuration properties

The file `/app/config/symphony/symphony-global.properties` (`C:\app\config\symphony\symphony-global.properties` on 
Windows) can be used to override the default application properties bundled in the resource 
[symphony-global.properties](symphony-ws/src/main/resources/symphony-global.properties). In particular, the 
_api.base_url_ property may want to be overridden to point to a remote server when running the API tests. 

### Frontend

In the interest of efficiency the frontend is can be served by a separate frontend server. In the case of Apache 
an example virtual host file is included [here](example-config/apache/vhosts.d/example-vhost.conf). To maintain the 
same-origin policy and avoid CORS issues the frontend server needs to proxy REST API calls. The above sample Apache 
configuration file illustrates how to accommodate this. 

Another option is to have the application server itself serve the frontend, eliminating the need for a 
separate frontend server. In the case of Wildfly, see
[this guide](http://www.mastertheboss.com/web/jboss-web-server/how-to-serve-static-content-in-wildfly-applications/). 


## Testing

For the backend there are unit tests and tests exercising the REST API. They are both handled using the Maven 
Surefire plugin, and since it is often desirable to run either of the test suites there are two maven profiles to 
control this.

To run only the *unit tests* make the _skip-apitests_ profile active, for instance like so:
```
mvn surefire:test -Ponly-apitests
```
To run only the API tests activate the _only-apitests_ profile:
```
mvn surefire:test -Pskip-apitests
```
If no profile is specified both test suites will be run.

### REST API tests credentials

The API tests need credentials which are acquired from the four properties *symphony.username*, *symphony.password*,  
*symphony.adminusername*, and *symphony.adminpassword*, whose values need to be set appropriately.

They can either be specified in the application properties file (`/app/config/symphony/symphony-global.properties`) 
or using a set of -D flags when invoking Maven:
```
mvn surefire:test ... -Dsymphony.username=XXXX -Dsymphony.password=YYYY ...
```


### Frondend tests

There are also frontend tests, see [frontend/README](frontend/README.md) for more details.

### Swagger

The package comes bundled with [Swagger](https://swagger.io/) which can be used for exploring APIs and debugging, but 
may want to be disabled in a 
production environment. By default it is available at the */symphony-ws/swagger* endpoint. 

## License

Symphony is licensed under the 2.0 version of the Apache License, see [LICENSE](LICENSE).
