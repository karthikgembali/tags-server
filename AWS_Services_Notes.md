# AWS Services - Complete Notes for Interview Preparation

## A. EC2 (Elastic Compute Cloud)

EC2 is a VM (Virtual Machine) that AWS provides. A VM is a system inside a system having its own OS, CPU, RAM, everything sharing the main system. In real life, we use this to deploy our server project into EC2 and we can run our server there.

**Step-by-step process:**

1. Create an EC2 instance in AWS by clicking 'Launch Instance'.
2. Pick the OS image that you require for VM (Linux, Windows, Ubuntu, etc.).
3. Select instance type (for free tier, use `t2.micro` or `t3.micro`).
4. Based on these configurations, AWS will give you:
   - A **public IP address** (and a public DNS name like `ec2-xx-xx-xx.compute.amazonaws.com`)
   - An **SSH key pair** (.pem file) for secure login
5. Establish an SSH connection from your computer to the AWS VM:
   - Use command: `ssh -i your-key.pem ec2-user@<public-ip>`
   - In this terminal, install your environment (Node.js, npm, etc.)
   - Clone your repository that you want to run inside it
   - Run your server
6. **Important:** Configure **Security Groups** (firewall rules) to open the required port (e.g., port 3000 for your Express server).
7. Now your server runs and users can access your API using the public IP address (or public DNS name).

---

## B. EBS (Elastic Block Store)

EBS is the disk storage attached to your EC2 instance. It stores:
- The **operating system** (root volume)
- Your **application code and binaries**
- Installed **packages and dependencies**
- **Runtime environments** (Node.js, Java, etc.)
- **Logs and temporary data**
- Any **data files** your application needs

Think of it as the **hard drive/SSD inside your EC2 computer**. When you create an EC2 instance, AWS automatically attaches a root EBS volume. You can also attach additional EBS volumes for extra storage.

---

## C. S3 (Simple Storage Service)

S3 stores files (images, PDFs, videos, static assets, backups, etc.) as **objects** in **buckets** (like folders).

**Key Concepts:**
- **Bucket**: Container for objects (like a folder)
- **Object**: A file stored in S3
- **Key**: The file path/name inside the bucket (e.g., `images/profile.jpg`)
- **Value**: The actual file data + metadata (size, content-type, last modified, etc.)

**Use Cases:**

1. **Static Website Hosting**: Build an Angular/React app → upload the build folder to an S3 bucket → enable "Static Website Hosting" → AWS gives you a website URL (no server needed).

2. **File Storage**: Store user-uploaded images, documents, etc.

3. **Backups**: Store database backups, EBS snapshots, etc.

**Access Methods:**
- HTTP/HTTPS URLs (public or private)
- AWS SDK (programmatic access from your code)
- Pre-signed URLs (temporary access to private files)
- CDN integration (CloudFront for faster global delivery)

**Difference between S3 and EBS:**
- **EBS**: Block storage attached to **one EC2 instance** at a time (like an internal SSD). Used for OS, app code, logs.
- **S3**: Object storage accessible via **HTTP API from anywhere** (like Google Drive). Used for images, static files, backups, large files.

---

## D. Lambda (Serverless Functions)

Lambda is used to run a small piece of code without the need of managing any servers. It's useful for:
- Small, independent functions
- Event-driven tasks (HTTP requests, file uploads, scheduled jobs)
- Spiky or unpredictable traffic
- Pay-per-use (only pay when code runs)

**Step-by-step process:**

1. Write a small function (handler) that processes incoming data:
   ```javascript
   const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
   const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
   
   const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-1' }));
   
   exports.handler = async (event) => {
       const body = JSON.parse(event.body);
       const { userId, name, email, phone } = body;
       
       // Store user data in DynamoDB
       await dynamoClient.send(new PutCommand({
           TableName: 'Users',
           Item: {
               userId: userId,
               name: name,
               email: email,
               phone: phone || null,
               createdAt: new Date().toISOString()
           }
       }));
       
       return {
           statusCode: 200,
           headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
           body: JSON.stringify({ success: true, message: 'User data stored successfully' })
       };
   };
   ```

2. Create a Lambda function in AWS:
   - Choose runtime (Node.js, Python, Java, etc.)
   - Upload/paste your function code
   - Add IAM permissions for DynamoDB access

3. Set a trigger to run this function:
   - **API Gateway HTTP endpoint** (most common for web APIs)
   - S3 upload event
   - Scheduled event (cron)
   - DynamoDB stream
   - etc.

4. When user submits a form:
   - Frontend hits the API Gateway endpoint
   - API Gateway invokes your Lambda function
   - Lambda processes the data and writes to DynamoDB
   - Returns response to the user

**Difference between Lambda and EC2:**
- **Lambda**: Small, independent functions; serverless; auto-scales; pay per execution; no server management.
- **EC2**: Long-running servers; full control over OS; WebSocket connections; background workers; you manage scaling, patching, etc.

---

## E. DynamoDB (NoSQL Database)

DynamoDB is a fully managed **NoSQL database** that stores data as **items** (documents) in **tables**.

**Key Concepts:**
- **Table**: Collection of items (like a database table, but NoSQL)
- **Item**: One record/document (like a row, but stored as JSON)
- **Attributes**: Fields/properties in an item (like columns)
- **Primary Key**:
  - **Partition Key only** (e.g., `userId`)
  - OR **Partition Key + Sort Key** (e.g., `userId` + `timestamp`)

**Example Item:**
```json
{
  "userId": "u123",
  "name": "Alice",
  "email": "alice@example.com",
  "preferences": {
    "theme": "dark",
    "language": "en"
  }
}
```

**Characteristics:**
- Key-value/document database (not relational like MySQL)
- Fully managed (no servers to manage)
- Auto-scaling
- Fast performance (millisecond latency)
- Pay per read/write capacity or on-demand

**Use Cases:**
- User profiles and preferences
- Session data
- Activity logs
- Real-time applications

---

## EBS SNAPSHOTS STORED IN S3 - EXPLAINED

### What is an EBS Snapshot?

An EBS snapshot is a **backup/copy of your EBS volume** at a specific point in time. AWS stores snapshots in S3 (you don't manage this directly - it's handled automatically by AWS).

### How Snapshots Work:

1. **You create a snapshot:**
   - In AWS Console → EC2 → Volumes → Select volume → Create Snapshot
   - Or via AWS CLI/API: `aws ec2 create-snapshot --volume-id vol-123abc`

2. **AWS stores it in S3:**
   - AWS handles this automatically
   - You don't see it in your S3 buckets (it's managed by AWS)
   - You see it under EC2 → Snapshots

3. **What gets backed up:**
   - All data on the EBS volume at that moment
   - **Incremental**: Only changed blocks are stored (saves space and cost)

### Purpose and Use Cases:

1. **Backup and Recovery:**
   - Before major changes, create a snapshot
   - If something breaks, restore from snapshot

2. **Creating New Volumes:**
   - Create a new EBS volume from a snapshot
   - Useful for cloning environments (dev, staging, production)

3. **Migrating Data:**
   - Snapshot in Region A → Copy to Region B → Create volume in Region B

4. **Disaster Recovery:**
   - Regular snapshots ensure you can restore your system

### Step-by-Step Example:

**Scenario:** You have an EC2 instance running your Express server, and you want to backup before updating.

1. **Create snapshot:**
   - EC2 Console → Volumes → Select your volume → Actions → Create Snapshot
   - Name it: "backup-before-update-2026-01-27"

2. **Wait for completion:**
   - Status changes from "pending" to "completed"

3. **If you need to restore:**
   - EC2 Console → Snapshots → Select your snapshot → Actions → Create Volume
   - Attach the new volume to your EC2 instance

4. **Copy to another region (if needed):**
   - Snapshots → Select snapshot → Actions → Copy Snapshot
   - Choose destination region

### Important Points:

- Snapshots are stored in S3 (managed by AWS)
- **Incremental**: Only changed blocks are stored
- You pay for snapshot storage (cheaper than keeping a full copy)
- Snapshots persist even if you delete the original volume
- You can create volumes from snapshots in different availability zones or regions

---

## Summary of Key Differences

| Service | Type | Use Case | Key Feature |
|---------|------|----------|-------------|
| **EC2** | Compute | Long-running servers, full control | Virtual machine |
| **EBS** | Storage | Disk attached to EC2 | Block storage (like SSD) |
| **S3** | Storage | Files, images, static websites | Object storage (like Google Drive) |
| **Lambda** | Compute | Small functions, event-driven | Serverless, pay per use |
| **DynamoDB** | Database | NoSQL, fast queries | Key-value/document store |

---

## Interview Tips

1. **Always explain with real-world examples** from your experience
2. **Know when to use each service** (Lambda vs EC2, S3 vs EBS)
3. **Understand the cost model** (pay per use vs pay per hour)
4. **Mention scalability** (auto-scaling, horizontal scaling)
5. **Security concepts** (Security Groups, IAM roles, encryption)

---

*Notes prepared for 3.5 years experienced Full Stack Developer interview preparation*
