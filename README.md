# Chat App with Keycloak IAM

- [Introduction](#-introduction)  
  - [Computer Screenshot](#computer)  
  - [Mobile Screenshot](#mobile)  
- [What the App Is](#-what-the-app-is)  
- [Why It Was Developed](#-why-it-was-developed)  
- [What This App Is Not](#-what-this-app-is-not)  
- [Tech Stack](#tech-stack)  
- [Installation and Deployment](#-installation-and-deployment)  
  - [Prerequisites](#prerequisites)  
  - [Keycloak Setup](#keycloak-setup)  
  - [MySQL Setup](#mysql-setup)  
  - [App Setup](#app-setup)  
  - [Variable Explanation](#variable-explanation) 
  - [Keycloak Certificate](#keycloak-certificate)
  - [Running the App](#running-the-app)  
  - [Database Seeding](#database-seeding)
- [DevSecOps Files](#devsecops-files) 
- [Known Limitations](#known-limitations) 
- [Security Discussion](#security-discussion)  
  - [Setup](#setup)  
  - [IAM](#iam)  
  - [App Runtime](#app-runtime)  
  
# Introduction

A lightweight chat application designed to demonstrate secure authentication and authorization using **Keycloak** as the Identity and Access Management (IAM) system, with **Role-Based Access Control (RBAC)** for managing user permissions.  


### Computer
<p align="center">
  <img src="repo_resources/Computer_Screen.png">
</p>

### Mobile
<p align="center">
  <img height=400 src="repo_resources/Mobile_Screen.PNG">
</p>

---

## What the App Is
- **Authentication & Authorization Delegated to IAM** – All sign-in requests are handled by the IAM, which also defines each user’s role and corresponding access rights.
- **No Passwords Stored** – The app does not store or manage any sensitive credentials. This is entirely delegated to the IAM.  
- **JWT-Based Security** – After login, users receive a **JWT (JSON Web Token)** containing their **roles and permissions**. Then, the application checks the JWT for every request/action to determine whether the user should be authorized or not.
---

## Why It Was Developed
- **Part of a Multi-Phase Enterprise Security Project** – This app is one component of a larger **Cybersecurity, Software Engineering, and DevSecOps project** that simulates a realistic enterprise environment, including IAM, secure CI/CD, centralized monitoring, secrets management, and attack simulation.   
- **Role-Based Access Control (RBAC)** – Demonstrates how an IAM can enforce RBAC seamlessly within an application.  
- **Reference Implementation** – Intended as a simple example for integrating apps with Keycloak IAM. 
- **Utilized In a Secure CI/CD Pipeline**  – The app was used to demonstrate a secure, end-to-end CI/CD Pipeline.

[Learn more about the larger project here.](https://github.com/abdrnasr/Enterprise-Cybersecurity-DevSecOps-Environment-Lab)  

---

## What This App Is Not
-  A full-fledged chat platform (no voice, video, or image sharing).  
-  A system with private chat rooms or complex social features.  
-  A real-time chatting app.
-  A production-ready messaging service — this is strictly a **demo/reference project**.  

---

## Tech Stack
- **Frontend:** `Next.js (React)`
- **Backend:** `Next.js` with Server Actions / API routes  
- **Authentication:** `Keycloak` (OIDC, JWT), `Auth.js` 
- **Database:** Minimal `MySQL` database to hold message and user data.

Any IAM that supports role definition will work. However, for this project, `Keycloak` was chosen.

---

## Installation and Deployment
### Prerequisites
- `Node.js`
- `Keycloak` 
- `MySQL` (Docker)

### Keycloak Setup
For Keycloak, I already have a manually deployed Keycloak instance in my environment, which can be found [here](https://github.com/abdrnasr/Enterprise-Cybersecurity-DevSecOps-Environment-Lab/tree/main/phase2_app_iam/lab-steps-phase-2.md). You can also deploy it using `Docker`, but this would not be covered here.

### MySQL Setup
I have provided a [docker-compose](additional_files/mysql_docker/docker-compose.yml) file that deploys `MySQL` and [Adminer](https://www.adminer.org/en/). However, this is only a basic `Docker` example. Do not use weak credentials or store secrets in it.

```docker
services:
  db:
    image: mysql:9.4
    container_name: iam-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: pass
      MYSQL_DATABASE: iam_chat
    ports:
      - "3306:3306"           # host:container
    volumes:
      - mysql_data:/var/lib/mysql
```
This will deploy a MySQL instance that can be accessed using the following connection string:
```bash
DATABASE_URL="mysql://root:pass@localhost:3306/iam_chat"
```

### App Setup
To run the app, clone the project at some path. Then, you need to create a `.env` file, which contains the following variables:
```
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET="RANDOM_LONG_STRING"

KEYCLOAK_ISSUER=https://192.168.33.6/sec/realms/master
KEYCLOAK_CLIENT_ID=chat-app
KEYCLOAK_CLIENT_SECRET="Generated_by_keycloak"

DATABASE_NAME=iam_chat
DATABASE_URL="mysql://root:pass@localhost:3306/iam_chat"

SEEDING_SECRET="ANOTHER_LONG_SEC"
```
### Variable Explanation:
- **NEXTAUTH_URL**: The base URL of the `Next.js` app.
- **AUTH_SECRET**: A random secret that `auth.js` uses to encrypt the user access token cookie, instead of storing it as plain text in the browser.
- **KEYCLOAK_ISSUER**: The path to the `Keycloak` realm.
- **KEYCLOAK_CLIENT**: The name of the client in `Keycloak` that you chose.
- **KEYCLOAK_CLIENT_SECRET**: A secret generated by `Keycloak` to identify your client. This must be kept secret.
- **DATABASE_NAME**: The name of the database used in `MySQL`.
- **DATABASE_URL**: The connection string used by `MySQL`'s client to interact with the `MySQL` server.
- **SEEDING_SECRET**: A secret that you generate to seed the database. Without it you cannot seed the database through the web app.

### Keycloak Certificate
To be able to interact with `Keycloak` using HTTPS (and encrypt traffic), you need a TLS certificate. For the purpose of development, you can issue your own certificate and self-sign it. However, `auth.js` may fail, because it requires a properly signed certificate. You can disable this check in multiple ways. For example, you could either disable certificate validation, or you could pass the path to the certificate in the following environment variable:

```bash
NODE_EXTRA_CA_CERTS=/path/to/pem/cert 
```

### Running The App
After setting up these variables, you can now build and run the app.

```bash
# Dev Build
npm run dev

# or
# Production Build
npm run build
npm run start
```
### Database Seeding
For the app to function correctly, you need to have a database already in MySQL. This database should be empty, and the app can construct the required tables using the seeding endpoint. The app provides the route `/api/seeding` to create the database tables needed by the app. There are multiple ways to seed it.
#### Method 1:
You can seed the database by visiting the following URL and providing the SECRET as a search parameter.

http://app-host-name:3000/api/seeding?secret=SEEDING_SECRET

The **SEEDING_SECRET** is the same secret you have provided in the **.env** file. 

#### Method 2:

If you prefer to avoid passing the secret through your browser as a query parameter. You can use the [seeder.py](additional_files/scripts/seeder.py) script that I provided, which sends the request through `Python` as an HTTP header (header name: `x-seeding-secret`).

```bash
python seeder.py localhost:3000 $SEEDING_SECRET
```

With that done, you should be able to open your browser, sign in using Keycloak, and use the app.

<a id="known-limitations"></a>

## DevSecOps Files

This app was specifically developed to be used as a part of the [Enterprise-Cybersecurity-DevSecOps-Environment-Lab](https://github.com/abdrnasr/Enterprise-Cybersecurity-DevSecOps-Environment-Lab) Project. During this time, many additional files were introduced to support the CI/CD pipeline. This section explains these files and folders. 

- `.gitlab-ci.yml` - Contains the stages and steps required for the CI/CD pipeline. Currently, it contains all the stages of the pipeline, including security scanning, build & release, release signals to `Elasticsearch`, but not SAST.
- [`vitest.config.mts`](https://github.com/abdrnasr/Enterprise-Cybersecurity-DevSecOps-Environment-Lab/blob/main/phase6_secure_pipeline/lab-steps-phase-6.md#unit-testing-and-coverage-reporting) - Contains configurations about `Vitest`, such as the tests to include and coverage metrics ...
- `test` - A folder that contains various unit tests
- [`seeder_sec.py`](https://github.com/abdrnasr/Enterprise-Cybersecurity-DevSecOps-Environment-Lab/blob/main/phase6_secure_pipeline/lab-steps-phase-6.md#build-stage) - Used to automatically seed the `MySQL` database in the `build & release` stage of the CI/CD pipeline
- [`extract_cookie.py`](https://github.com/abdrnasr/Enterprise-Cybersecurity-DevSecOps-Environment-Lab/blob/main/phase6_secure_pipeline/lab-steps-phase-6.md#a-better-approach) - Interacts with `Keycloak` to generate a session token automatically. Used then for DAST scan. 
- `additional_files`
  - [`sonar-project-properties`](https://docs.sonarsource.com/sonarqube-server/10.8/analyzing-source-code/analysis-parameters#project-identification) - Contains configuration information for `Sonnarscanner CLI`
  - `deployment_scripts`
    - [`revert.py`](https://github.com/abdrnasr/Enterprise-Cybersecurity-DevSecOps-Environment-Lab/blob/main/phase6.1_feature_writing_and_reversion/lab-steps-phase-6.1.md#the-revertpy-python-script) - Used to return to a previous stable version.
    - [`deploy.py`](https://github.com/abdrnasr/Enterprise-Cybersecurity-DevSecOps-Environment-Lab/blob/main/phase6_secure_pipeline/lab-steps-phase-6.md#deployment-phase) - Chooses an appropriate deployment spot (Blue/Green) and deploys the app in it.
  - `gitlab_configs`
    - `No_Monitoring.gitlab-ci` - Contains all the security scanning, build, and deployment stages, but no monitoring.
    - `No_SAST_FULL.gitlab-ci.yml` - Contains all stages, but no SAST or monitoring.
  - `my_sql_docker`
    - `docker-compose` - A simple compose file that deploys a `MySQL` database and a database viewer called `Adminer`.
  - `scripts`:
    - `emit_release_event.py`- Used to send "release finished" signal to `Elasticsearch`
    - `seeder.py` - The original `seeder.py` script that only supports HTTP seeding.
  - [`sonarqube_script`](https://github.com/abdrnasr/Enterprise-Cybersecurity-DevSecOps-Environment-Lab/blob/main/phase6_secure_pipeline/lab-steps-phase-6.md#static-application-security-testing-sast) 
    - `docker-compose.yml` - A `Docker` file that starts up `SonarQube` and `PostgreSQL`
    - `initdb`
      - `01-sonarqube.sql` - A script that is executed the first time the container is initialized to configure `PostgreSQL` credentials and tables.

For more information about these files, you should consult the [Enterprise-Cybersecurity-DevSecOps-Environment-Lab](https://github.com/abdrnasr/Enterprise-Cybersecurity-DevSecOps-Environment-Lab) project. Specifically, phases 5, 6, 6.1, and 7 will have a detailed explanation about these files.

## Known Limitations
- **Base Address Change Is not Possible:** While I tried to find a way to implement it in the app, most authentication libraries struggle with this issue (specifically, `Next-Auth`, `Auth.js`, & `Better Auth`). Thus, you need to host this on the base address on a reverse proxy, or perform path truncation on the reverse proxy itself. However, given enough time, one can fully implement an authentication solution from scratch.
- **Intentional Bad Coding Practices:** The app contains various intentional poor coding practices, as there is a chance that this app will be used as a part of Static Security Scanning (SAST). 
<a id="security-discussion"></a>

## Security Discussion
### Setup
- The setup of this app uses the best practices to secure the app's secrets. That means that no code file should contain any secret, and the secrets may not be hard-coded.
- Before the app can be used, you must seed the database. The seeding of the app can only be allowed to those possessing the **SEEDING_SECRET**.
- You can automate the entire deployment process using scripts, and keep all secrets secure.
### IAM
- User's credentials and roles are entirely handled by the IAM. This allows for consistent accounts across multiple services without having to manage credentials for each app. 
- Since roles are provided by the IAM, you could easily grant each user different roles without touching the application server.
### App Runtime
- All input fields were checked for Cross-Site Scripting and SQL Injection attacks.
- All SQL queries use prepared statements to protect against injection attacks.
- All insecure client data is validated on the server using [Zod](https://zod.dev/).
- Next.js provides Cross Site Request Forgery protection for server actions, and therefore protected from CSRF attacks.
- Before the client can perform an action or access any protected route, the roles are checked. Different roles possess different permissions, and permissions can be assigned in the **lib/authcheck.ts** file.

```typescript
// Each role has a list of allowed permissions
const ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  'chat-admin': ["post.create", "post.edit", "post.delete", "post.view"],
  'chat-editor': ["post.create", "post.edit", "post.view"],
  'chat-user': ["post.view", "post.create"],
};

// Check if a user has a ROLE with the specific permission
export function hasPermission(roles: string[], permission: string): boolean {
  return roles.some(role => ROLE_PERMISSIONS[role]?.includes(permission));
}
```
- Next-Auth protects session cookies by encryption.
- Error paths are protected with conditionals and exception handling.

