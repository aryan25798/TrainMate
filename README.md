# TrainMate &bull; Cohort & Trainer Automatic Allocation System

[![Cognizant Academy](https://img.shields.io/badge/Cognizant-Digital%20Academy-000048.svg)](https://www.cognizant.com)
[![Angular 19](https://img.shields.io/badge/Angular-19.1-DD0031.svg?logo=angular)](https://angular.dev)
[![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3.5-6DB33F.svg?logo=springboot)](https://spring.io)
[![MySQL 8.0](https://img.shields.io/badge/MySQL-8.0-4479A1.svg?logo=mysql)](https://www.mysql.com)
[![Apache POI](https://img.shields.io/badge/Apache%20POI-5.2.5-D22128.svg)](https://poi.apache.org)

TrainMate is a full-stack enterprise web application engineered to streamline the management of technical training cohorts and automate trainer allocations within **Cognizant Academy**.

---

## 1. Project Overview

In corporate academy environments, coaches manage numerous training batches ("cohorts") that require qualified trainers with matching skills, availability, and balanced workloads. 

**TrainMate solves this by providing:**
1. **Direct Cohort Creation & Excel Upload**: Coaches can either create cohorts on-the-fly using a modern form or batch-upload cohorts via an Excel file (`.xlsx`).
2. **Deterministic 100-Point Allocation Engine**: Automatically evaluates trainers and assigns the best candidate based on 5 weighted criteria:
   - **Skill Match (40 pts)**: Proportional match against required technologies
   - **Availability (20 pts)**: Verified date coverage across batch dates
   - **Current Workload (15 pts)**: Headroom under maximum workload capacity
   - **Experience (15 pts)**: Seniority and years of industry training experience
   - **Cohort Delivery Track Record (10 pts)**: Reliability and past performance
3. **Admin Reassignment**: Admins have global visibility, workload balancing controls, and one-click trainer reassignment.
4. **Internal Mailbox**: Instant automated messaging notifying coaches and trainers of batch assignments without complex read/unread overhead.

---

## 2. Database Architecture (4 Core Tables)

The database strictly follows a clean 4-table relational ER schema in MySQL (`trainmate_db`):

```
+----------------+          +------------------------+
|     USERS      |          |        TRAINER         |
+----------------+          +------------------------+
| user_id (PK)   |<---+     | trainer_id (PK)        |
| name           |    +-----| user_id (FK)           |
| email          |          | skill_set              |
| password       |          | experience_years       |
| role           |          | available_from         |
| created_date   |          | available_till         |
+----------------+          | current_workload       |
        ^                   | max_workload           |
        |                   +------------------------+
        |                               ^
        |                               |
+-------+-------------------------------+------------+
|                       COHORT                       |
+----------------------------------------------------+
| cohort_id (PK)                                     |
| cohort_code                                        |
| service_line, stream, required_skill, location     |
| trainee_count, start_date, end_date                |
| coach_user_id (FK -> users.user_id)                |
| assigned_trainer_id (FK -> trainer.trainer_id)     |
| status (ASSIGNED, UNASSIGNED, ACTIVE, COMPLETED)   |
| created_date                                       |
+----------------------------------------------------+
        ^
        |
+-------+--------------------------------------------+
|                    NOTIFICATION (MAIL)             |
+----------------------------------------------------+
| notification_id (PK)                               |
| cohort_id (FK -> cohort.cohort_id)                 |
| receiver_user_id (FK -> users.user_id)             |
| notification_type                                  |
| message                                            |
| created_date                                       |
+----------------------------------------------------+
```

---

## 3. Technology Stack

- **Frontend**: Angular 19 (Standalone Components, Plus Jakarta Sans & Inter typography, Bootstrap 5, Bootstrap Icons, responsive mobile drawer)
- **Backend**: Spring Boot 3.3.5 (Java 21, Spring Web MVC, Spring Data JPA, Hibernate, Bean Validation)
- **Database**: MySQL 8.0 (`localhost:3306`)
- **Excel Processing**: Apache POI 5.2.5 (`poi-ooxml`)
- **Testing**: JUnit 5, Mockito

---

## 4. Getting Started

### Prerequisites
- **Java JDK 21+**
- **Apache Maven 3.9+**
- **Node.js v18+ or v20+**
- **MySQL Server 8.0+** running on `localhost:3306`

### Database Setup
Run the SQL scripts in your MySQL client (or MySQL Workbench):
```sql
SOURCE database/schema.sql;
SOURCE database/data.sql;
```
*Default root credentials configured in `application.properties`: `root` / `123456`.*

### Running the Backend (Spring Boot)
```bash
cd backend/trainmate-backend
mvn spring-boot:run
```
*Backend runs on [http://localhost:8080](http://localhost:8080).*

### Running the Frontend (Angular)
```bash
cd frontend/trainmate-ui
npm install
npm start
```
*Frontend runs on [http://localhost:4200](http://localhost:4200).*

---

## 5. Demo Credentials

You can use the 1-click demo buttons on the login screen or enter:

| Role | Username / Email | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Coach** | `coach01` | `password123` | Create cohorts, upload Excel files, monitor batch assignments |
| **Trainer** | `trainer01` | `password123` | View assigned batches, training schedules, incoming mails |
| **Admin** | `admin01` | `password123` | System oversight, trainer capacity balancing, manual reassignment |

---

## 6. Interview Quick Explanation Guide

1. **Architecture**: Angular 19 SPA communicates with Spring Boot REST APIs using JSON payloads. Data persistence is managed by MySQL via Hibernate/Spring Data JPA.
2. **Allocation Engine**: When a cohort is submitted, `TrainerAllocationService` evaluates all available trainers against `AllocationScorer`. Each trainer receives a score out of 100. The winning trainer is assigned atomically to `cohort.assigned_trainer_id`, their workload increments, and a Mail is logged in the `notification` table.
3. **Simplicity**: No bloated security frameworks; clear, transparent MVC design pattern.
