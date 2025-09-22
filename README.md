# 📑 Chat App with Keycloak IAM

- [📝 Introduction](#-introduction)  
  - [Computer Screenshot](#computer)  
  - [Mobile Screenshot](#mobile)  
- [🔑 What the App Is](#-what-the-app-is)  
- [🎯 Why It Was Developed](#-why-it-was-developed)  
- [🚫 What This App Is Not](#-what-this-app-is-not)  
- [⚙️ Tech Stack](#️-tech-stack)  
- [🚀 Installation and Deployment](#-installation-and-deployment)  
  - [Prerequisites](#prerequisites)  
  - [Keycloak Setup](#keycloak-setup)  
  - [MySQL Setup](#mysql-setup)  
  - [App Setup](#app-setup)  
  - [Variable Explanation](#variable-explanation) 
  - [Keycloak Certificate](#keycloak-certificate)
  - [Running the App](#running-the-app)  
  - [Database Seeding](#database-seeding) 
- [⚠️ Known Limitations](#known-limitations) 
- [🔒 Security Discussion](#security-discussion)  
  - [Setup](#setup)  
  - [IAM](#iam)  
  - [App Runtime](#app-runtime)  
  
# 📝 Introduction

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

## 🔑 What the App Is
- **Authentication & Authorization Delegated to IAM** – The app does not handle sign-in directly; all sign in requests are handled by the IAM. Also, the IAM defines the role of each registered user, which grants each user different access rights.
- **No Passwords Stored** – The app does not store or manage any sensitive credentials, this is entirely delegated to the IAM.  
- **JWT-Based Security** – After login, users receive a **JWT (JSON Web Token)** containing their **roles and permissions**. Then, the application checks the JWT for every request/action to determine whether the user should be authorized or not.
---

## 🎯 Why It Was Developed
- **Part of a Multi-Phase Enterprise Security Project** – This app is one component of a larger **Cybersecurity, Software Engineering, and DevSecOps project** that simulates a realistic enterprise environment, including IAM, secure CI/CD, centralized monitoring, secrets management, and attack simulation.   
- **Role-Based Access Control (RBAC)** – Demonstrates how an IAM can enforce RBAC seamlessly within an application.  
- **Reference Implementation** – Intended as a simple example for integrating apps with Keycloak IAM.  

👉 [Learn more about the larger project here.](https://github.com/abdrnasr/Enterprise-Cybersecurity-DevSecOps-Environment-Lab)  

---

## 🚫 What This App Is Not
- ❌ A full-fledged chat platform (no voice, video, or image sharing).  
- ❌ A system with private chat rooms or complex social features.  
- ❌ A real-time chatting app 
- ❌ A production-ready messaging service — this is strictly a **demo/reference project**.  

---

## ⚙️ Tech Stack
- **Frontend:** Next.js (React) 
- **Backend:** Node.js with Server Actions / API routes  
- **Authentication:** Keycloak (OIDC, JWT), Auth.js 
- **Database:** Minimal MySQL database to hold message and user data.

Any IAM should work as long as you can define roles for each user. However, for this project Keycloak was chosen.

---

## 🚀 Installation and Deployment
### Prerequisites
- Node.js
- Keycloak 
- MySQL (Docker)

### Keycloak Setup
For Keycloak, I already have a manually deployed Keycloak instance in my environment, which can be found [here](https://github.com/abdrnasr/Enterprise-Cybersecurity-DevSecOps-Environment-Lab/tree/main/phase2_app_iam/lab-steps-phase-2.md). You can also deploy it using docker, but this would not be covered here.

### MySQL Setup
I have provided a [docker-compose](docker-compose.yml) file that deploys the MySQL and [Adminer](https://www.adminer.org/en/). However, note that this is just a basic docker example file, and you should not use simple credentials or store secrets directly in this file.

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
To run the app, clone the project at some path. Then, you need to create a .env file that has the following variables
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="RANDOM_LONG_STRING"

KEYCLOAK_ISSUER=https://192.168.33.6/sec/realms/master
KEYCLOAK_CLIENT_ID=chat-app
KEYCLOAK_CLIENT_SECRET="Generated_by_keycloak"

DATABASE_NAME=iam_chat
DATABASE_URL="mysql://root:pass@localhost:3306/iam_chat"

SEEDING_SECRET="ANOTHER_LONG_SEC"
```
### Variable Explanation:
- **NEXTAUTH_URL**: The path to the base URL address to the Next.js app.
- **NEXTAUTH_SECRET**: A random secret that next-auth uses to encrypt the user access token cookie, instead of storing it as plain text in the browser.
- **KEYCLOAK_ISSUER**: The path to keycloak realm.
- **KEYCLOAK_CLIENT**: The name of the client in Keycloak that you chose.
- **KEYCLOAK_CLIENT_SECRET**: A secret generated by Keycloak to identify your client. This must be kept secret.
- **DATABASE_NAME**: The name of the database used in MySQL.
- **DATABASE_URL**: The connection string used by MySQL's client to interact with MySQL server.
- **SEEDING_SECRET**: A secret that you generate to seed the database. Without it you cannot seed the database through the web app.

### Keycloak Certificate
To be able to interact with Keycloak using HTTPs (and encrypt traffic), you need a TLS certificate. For the purpose of development, you can issue your own certificate and self sign it. However, next-auth may fail, because it requires a properly signed certificate. You can disable this check in multiple ways. For example, you could either disable certificate validation, or you could pass the path to the certificate in the following environment variable:

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
For the app to function correctly, you need to have a database already in in MySQL. This database should be empty, and the app can construct the required tables on using the seeding endpoint. The app provides the route /api/seeding to create the database tables needed by the app. There are multiple ways to seed it.
#### Method 1:
You can seed the database by visiting the following URL and providing the SECRET as a search parameter.

http://app-host-name:3000/api/seeding?secret=SEEDING_SECRET

The **SEEDING_SECRET** is the same secret you have provided in the **.env** file. 

#### Method 2:

If you prefer to avoid passing the secret through your browser as query parameter. You can use the [seeder.py](seeder.py) script that I provided, which sends the request through python as an HTTP header (header name:).

```bash
python seeder.py localhost:3000 $SEEDING_SECRET
```

With that done, you should be able to open your browser, sign in using Keycloak, and use the app.

<a id="known-limitations"></a>

## ⚠️ Known Limitations
- **Base Address Change Is not Possible:** While I tried to find a way to implement it in the app, most quick plug-in authentication libraries seem to struggle with this very issue (Next-Auth, Auth.js, & Better Auth). Thus, you need to host this on the base address on a reverse proxy, or perform path truncation on the reverse proxy itself. However, given enough time, one can fully implement a full authentication solution from scratch.
- **Intentional Bad Coding Practices:** The app contains various intentional poor coding practices, as there is chance that this app will be used as a part of Static Security Scanning (SAST). 
<a id="security-discussion"></a>

## 🔒 Security Discussion
### Setup
- The setup of this app uses the best practices to secure the apps secrets. That's no code files have any secret and they should not be hard coded into code.
- Before the app can be used, you must seed the database. The seeding of the app can only be allowed to those possessing the **SEEDING_SECRET**.
- You can automate the entire deployment process using scripts, and keep all secrets secure.
### IAM
- Users credentials and roles are entirely handled by the IAM. This allows for consistent accounts across multiple services without having to manage credentials for each app. 
- Since roles are provided by the IAM, you could easily grant each user different roles without touching the application server.
### App Runtime
- All input fields were checked for Cross-Site Scripting and SQL Injection attacks.
- All SQL queries use prepared statements to protect against injection attacks.
- All insecure client data is validated at the server using [Zod](https://zod.dev/).
- Next.js provides Cross Site Request Forgery protection for server actions, so all server actions are protected from CSRF.
- Before the client can perform and action or access any protected route, the roles are checked. Different roles possess different permissions, and the permission can be assigned in the **lib/authcheck.ts** file.

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


# chat-app-pipeline



## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

Already a pro? Just edit this README.md and make it your own. Want to make it easy? [Use the template at the bottom](#editing-this-readme)!

## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/topics/git/add_files/#add-files-to-a-git-repository) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin http://192.168.20.4/root/chat-app-pipeline.git
git branch -M main
git push -uf origin main
```

## Integrate with your tools

- [ ] [Set up project integrations](http://192.168.20.4/root/chat-app-pipeline/-/settings/integrations)

## Collaborate with your team

- [ ] [Invite team members and collaborators](https://docs.gitlab.com/ee/user/project/members/)
- [ ] [Create a new merge request](https://docs.gitlab.com/ee/user/project/merge_requests/creating_merge_requests.html)
- [ ] [Automatically close issues from merge requests](https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#closing-issues-automatically)
- [ ] [Enable merge request approvals](https://docs.gitlab.com/ee/user/project/merge_requests/approvals/)
- [ ] [Set auto-merge](https://docs.gitlab.com/user/project/merge_requests/auto_merge/)

## Test and Deploy

Use the built-in continuous integration in GitLab.

- [ ] [Get started with GitLab CI/CD](https://docs.gitlab.com/ee/ci/quick_start/)
- [ ] [Analyze your code for known vulnerabilities with Static Application Security Testing (SAST)](https://docs.gitlab.com/ee/user/application_security/sast/)
- [ ] [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/ee/topics/autodevops/requirements.html)
- [ ] [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/ee/user/clusters/agent/)
- [ ] [Set up protected environments](https://docs.gitlab.com/ee/ci/environments/protected_environments.html)

***

# Editing this README

When you're ready to make this README your own, just edit this file and use the handy template below (or feel free to structure it however you want - this is just a starting point!). Thanks to [makeareadme.com](https://www.makeareadme.com/) for this template.

## Suggestions for a good README

Every project is different, so consider which of these sections apply to yours. The sections used in the template are suggestions for most open source projects. Also keep in mind that while a README can be too long and detailed, too long is better than too short. If you think your README is too long, consider utilizing another form of documentation rather than cutting out information.

## Name
Choose a self-explaining name for your project.

## Description
Let people know what your project can do specifically. Provide context and add a link to any reference visitors might be unfamiliar with. A list of Features or a Background subsection can also be added here. If there are alternatives to your project, this is a good place to list differentiating factors.

## Badges
On some READMEs, you may see small images that convey metadata, such as whether or not all the tests are passing for the project. You can use Shields to add some to your README. Many services also have instructions for adding a badge.

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Support
Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Roadmap
If you have ideas for releases in the future, it is a good idea to list them in the README.

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.

## License
For open source projects, say how it is licensed.

## Project status
If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.
