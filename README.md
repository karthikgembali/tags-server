# 📄 Dynamic Document Generation System (DDS)

## 🚀 Overview

The Dynamic Document Generation System (DDS) is a full-stack web application designed to **automate the bulk creation of personalized, templated documents** (e.g., HR letters, financial slips) for businesses.

It eliminates the tedious and error-prone process of manually updating document values for hundreds or thousands of employees by using a powerful template merging engine. Users define custom tags once and then upload employee-specific data to generate all final documents instantly.

## ✨ Features

* **Custom Tag Definition:** Users can define and manage their own document tags (e.g., `<employeeName>`, `<salary>`) and corresponding codes.
* **Template Upload & Parsing:** Accepts standard `.docx` files as templates and parses the zipped XML structure on the server.
* **Dynamic Data Injection:** Supports the input or upload of large datasets to dynamically replace template tag codes with specific values for each recipient.
* **Bulk PDF Generation:** Efficiently processes the merge operation and generates a final, high-quality PDF document buffer.
* **Integrated Viewer:** Provides an integrated PDF viewer on the frontend for immediate preview and download of the generated files.

## 💻 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | `Angular` | Single Page Application (SPA) for the user interface and document preview. |
| **Backend** | `Node.js` (Express.js) | Server-side logic, API endpoint management, and file processing. |
| **File Handling** | `Multer` | Middleware for handling multipart/form-data, used for file uploads. |
| **Document Processing** | `PizZip` | Used to unzip and access the content of the binary `.docx` files (XML archive). |
| **Templating Engine** | `Docxtemplater` | Core library used for setting custom delimiters (`<`, `>`) and performing the data merge operation. |
| **Preview** | `ngx-extended-pdf-viewer` | Angular module for displaying the generated PDF output. |

## ⚙️ Installation and Setup

### Prerequisites

* Node.js (LTS version recommended)
* Angular CLI

### Backend Setup (`/server` directory)

1.  Clone the repository:
    ```bash
    git clone [Your-Repo-Link]
    cd [Your-Repo-Name]/server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    npm start
    ```
    (The API will typically run on `http://localhost:3000` or similar.)

### Frontend Setup (`/client` directory)

1.  Navigate to the client directory:
    ```bash
    cd ../client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Angular application:
    ```bash
    ng serve --open
    ```
    (The application will typically open in your browser at `http://localhost:4200`.)

## 🤝 Contribution

Contributions are welcome! If you find a bug or have a suggestion, please open an issue or submit a pull request.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
